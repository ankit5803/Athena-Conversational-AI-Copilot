# rag_pipeline.py
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from transformers import pipeline
from pinecone import Pinecone


# ===== Load env variables =====
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"

# ===== Initialize Pinecone =====
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# ===== Load embedding model (same as used in upsert) =====
embed_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# ===== Load a free HuggingFace LLM (Mistral-7B-Instruct) =====
# You can swap with "HuggingFaceH4/zephyr-7b-beta" if you want a lighter model.
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


qa_model = pipeline(
    "text-generation",
    model="distilgpt2",  # <-- public model
    device_map="auto",
    dtype="auto"
)
# ===== RAG function =====
def rag_query(query, top_k=5, max_new_tokens=300):
    # Step 1: Embed the query
    query_embedding = embed_model.encode([query]).tolist()

    # Step 2: Search Pinecone
    results = index.query(
        vector=query_embedding[0],
        top_k=top_k,
        include_metadata=True
    )

    # Step 3: Collect retrieved chunks
    contexts = [match["metadata"]["snippet"] for match in results["matches"]]

    # Step 4: Build prompt for the LLM
    context_text = "\n\n".join(contexts)
    prompt = f"""You are a helpful assistant. Use the context below to answer the question.

Context:
{context_text}

Question: {query}
Answer:"""

    # Step 5: Generate answer
    response = qa_model(prompt, max_new_tokens=max_new_tokens, do_sample=True)
    return response[0]["generated_text"]

# ===== Main =====
if __name__ == "__main__":
    while True:
        user_query = input("\n🔎 Ask a question (or type 'exit'): ")
        if user_query.lower() in ["exit", "quit", "q"]:
            break

        answer = rag_query(user_query)
        print("\n🧠 Answer:\n", answer)
