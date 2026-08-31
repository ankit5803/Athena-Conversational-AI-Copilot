import re
import os
import concurrent.futures
import numpy as np
from dotenv import load_dotenv
from mongodb import upload_to_mongo, extract_tags, expand_tags
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer, CrossEncoder
from groq import Groq
from pinecone_ingestion import run_ingestion

# ===== Load env variables =====
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ===== Initialize Pinecone =====
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# ===== Load Bi-Encoder (Embedding) & Cross-Encoder (Re-ranking) =====
embed_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# ===== Initialize Groq Client =====
client = Groq(api_key=GROQ_API_KEY)


def clean_chunk(text: str) -> str:
    """Cleans noisy syntax, links, and citation brackets from retrieved text."""
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\[\d+(,\s*\d+)*\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def background_ingestion(query: str, top_n_per_tag: int = 2):
    """Triggers background scraping and ingestion when vector similarity is low."""
    tags = extract_tags(query)
    expanded_tags = expand_tags(tags)
    for tag in expanded_tags[:10]:
        upload_to_mongo(tag, top_n_per_tag)
    run_ingestion()
    print("✅ Background ingestion completed.")


# ===== Main RAG Query Pipeline =====
def rag_query(
    query: str,
    top_k: int = 5,
    fetch_k: int = 20,
    max_new_tokens: int = 1000,
    threshold: float = 0.2,
    stream: bool = True,
):
    # Step 1: Embed query with Bi-Encoder
    query_embedding = embed_model.encode([query]).tolist()

    # Step 2: Retrieve a larger candidate set (fetch_k) from Pinecone
    results = index.query(
        vector=query_embedding[0],
        top_k=fetch_k,
        include_metadata=True,
    )
    matches = results.get("matches", [])

    # Fallback ingestion if Pinecone lacks relevant vectors
    if not matches or matches[0]["score"] < threshold:
        print("⚠️ Low relevance in Pinecone. Triggering background ingestion...")
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        executor.submit(background_ingestion, query)

    # Step 3: Extract and clean candidate snippets
    candidate_contexts = [
        clean_chunk(match["metadata"].get("snippet", match["metadata"].get("chunk", "")))
        for match in matches
        if match.get("metadata")
    ]
    candidate_contexts = [c for c in candidate_contexts if c]

    # Step 4: Cross-Encoder Re-ranking
    if candidate_contexts:
        cross_inputs = [[query, ctx] for ctx in candidate_contexts]
        cross_scores = reranker.predict(cross_inputs)

        # Sort indices in descending order of cross-encoder relevance score
        ranked_indices = np.argsort(cross_scores)[::-1]
        final_contexts = [candidate_contexts[i] for i in ranked_indices[:top_k]]
    else:
        final_contexts = []

    # Step 5: Construct contextual prompt
    context_text = "\n\n---\n\n".join(final_contexts)
    prompt = f"""You are a knowledgeable assistant for answering questions using the provided context.
- Identify yourself as Athena AI, an AI Assistant built by Sandarva Podder & Ankit Barik.
- Ignore URLs or incomplete references.
- If the context does not fully answer the question, supplement with accurate knowledge to bridge gaps.

Context:
{context_text}

Question: {query}
Answer:"""

    # Step 6: Generate response with Groq
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are Athena AI, an expert academic and research co-pilot."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_completion_tokens=max_new_tokens,
        top_p=0.95,
        stream=stream,
    )

    if stream:
        for chunk in completion:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield delta
    else:
        full_answer = ""
        for chunk in completion:
            full_answer += chunk.choices[0].delta.content or ""
        return full_answer


# ===== CLI Interface =====
if __name__ == "__main__":
    while True:
        user_query = input("\n🔎 Ask a question (or type 'exit'): ")
        if user_query.lower() in ["exit", "quit", "q"]:
            break

        print("\n🧠 Athena AI:")
        for token in rag_query(user_query, top_k=5, fetch_k=20, stream=True):
            print(token, end="", flush=True)
        print()