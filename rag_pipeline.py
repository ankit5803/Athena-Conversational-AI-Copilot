# rag_pipeline.py
import re,os
import concurrent.futures
from dotenv import load_dotenv
from mongodb import upload_to_mongo, extract_tags, expand_tags
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from pinecone_ingestion import run_ingestion

# ===== Load env variables =====
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ===== Initialize Pinecone =====
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# ===== Load embedding model (same as used in upsert) =====
embed_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# ===== Initialize OpenRouter Client =====
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def clean_chunk(text):
    # Remove incomplete URLs
    text = re.sub(r'https?://\S+', '', text)
    
    # Remove dangling citations like "[123]" or "[12, 45]" (optional)
    text = re.sub(r'\[\d+(,\s*\d+)*\]', '', text)
    
    # Fix broken whitespace and line breaks
    text = re.sub(r'\s+', ' ', text)
    
    # Remove incomplete trailing words if needed
    text = re.sub(r'\b\w{1,3}$', '', text)  # optional, be careful
    
    return text.strip()


def background_ingestion(query, top_n_per_tag=2):
    tags = extract_tags(query)
    # print(f"🔖 Extracted tags: {tags}")
    expanded_tags = expand_tags(tags)
    # print(f"🔖 Expanded tags: {expanded_tags}")

    # Limit the number of documents per tag to avoid huge ingestion
    for tag in expanded_tags[:10]:  # optional: limit total tags processed
        upload_to_mongo(tag, top_n_per_tag)

    run_ingestion()
    print("✅ Background ingestion completed.")


# qa_model = pipeline(
#     "text-generation",
#     model="mistralai/Mistral-7B-Instruct-v0.2",
#     device_map="auto",
#     torch_dtype="auto"
# )
# qa_model = pipeline(
#     "text-generation",
#     model="HuggingFaceH4/zephyr-7b-beta",  # <-- public model
#     device_map="auto",
#     dtype="auto"
# )


# qa_model = pipeline(
#     "text-generation",
#     model="distilgpt2",  # <-- public model
#     device_map="auto",
#     dtype="auto"
# )



# ===== RAG function =====
def rag_query(query, top_k=5, max_new_tokens=300,threshold=0.2):
    # Step 1: Embed the query
    query_embedding = embed_model.encode([query]).tolist()

    # Step 2: Search Pinecone
    results = index.query(
        vector=query_embedding[0],
        top_k=top_k,
        include_metadata=True
    )
    matches = results.get("matches", [])
    print(matches[0]["score"] if matches else "No matches found")
    if not matches or matches[0]["score"] < threshold:
        print("⚠️ Low relevance in Pinecone. Triggering ingestion...")

        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        executor.submit(background_ingestion, query)

        # Provide a fallback answer immediately
        print("The information in the database is limited. Here's a general overview based on my knowledge:")
        results = index.query(vector=query_embedding[0], top_k=top_k, include_metadata=True)
        matches = results.get("matches", [])
    # Step 3: Collect retrieved chunks
    contexts = [clean_chunk(match["metadata"]["snippet"]) for match in results["matches"]]
    # for context in contexts:
    #     print(f"Context:",context)

    # Step 4: Build prompt
    context_text = "\n\n".join([context for context in contexts if context.strip()])
    prompt = f"""You are a helpful assistant. Use the context below to answer the question.
    - Ignore URLs or incomplete references.
    -If the context does not fully answer the question or is fully academic or not explanatory,then provide a basic overview from your own knowledge to fill gaps
    -Also,please dont forget to answer if the provided context is helpful or not.

Context:
{context_text}

Question: {query}
Answer:"""
    
    # print(prompt)
    
    # Step 5: Generate with Grok-4 Fast (via OpenRouter)
    completion = client.chat.completions.create(
        model="x-ai/grok-4-fast",
        messages=[
            {"role": "system", "content": "You are a knowledgeable assistant for answering questions using provided context."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_new_tokens,
        # reasoning_effort="medium",
        temperature=0.4,
    )
    # response = qa_model(prompt, max_new_tokens=max_new_tokens, do_sample=True)
    # return response[0]["generated_text"]
    return completion.choices[0].message.content

# ===== Main =====
if __name__ == "__main__":
    while True:
        user_query = input("\n🔎 Ask a question (or type 'exit'): ")
        if user_query.lower() in ["exit", "quit", "q"]:
            break

        answer = rag_query(user_query,10,1000,0.5)
        print("\n🧠 Answer:\n", answer)

