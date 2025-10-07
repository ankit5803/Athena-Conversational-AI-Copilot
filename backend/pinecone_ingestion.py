# pinecone_ingestion.py
import os
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from tqdm import tqdm
from preprocess_pipeline import preprocess_pdfs_into_chunks
from dotenv import load_dotenv

# ---------------------- Load environment ----------------------
load_dotenv()
MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"
DIMENSION = 768
BATCH_SIZE = 64


def upsert_to_pinecone(chunks, paper_ids):
    if not chunks:
        print("⚠️ No chunks to upsert!")
        return

    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    pc = Pinecone(api_key=PINECONE_API_KEY)

    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    index = pc.Index(INDEX_NAME)

    def batch(iterable, n):
        for i in range(0, len(iterable), n):
            yield iterable[i:i+n]

    print(f"Embedding {len(chunks)} chunks and upserting to Pinecone...")

    for batch_items in tqdm(list(batch(chunks, BATCH_SIZE)), desc="Upserting batches"):
        texts = [c["chunk"] for c in batch_items]
        embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)

        vectors = [
            {
                "id": f"{c['arxiv_id']}_chunk{c['chunk_index']}",
                "values": emb.tolist(),
                "metadata": {
                    "arxiv_id": c["arxiv_id"],
                    "title": c["title"],
                    "chunk_index": c["chunk_index"],
                    "snippet": c["chunk"][:300]
                }
            }
            for c, emb in zip(batch_items, embeddings)
        ]
        index.upsert(vectors=vectors)

    # ✅ Update Mongo once all upserts are done
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    papers_collection.update_many(
        {"arxiv_id": {"$in": paper_ids}},
        {"$set": {"pinecone_indexed": True}}
    )
    client.close()
    print("✅ Ingestion complete.")

# ---------------------- Public Runner ----------------------
def run_ingestion():
# ---------------------- Stage 2: Preprocess PDFs ----------------------

    chunks, paper_ids = preprocess_pdfs_into_chunks()

# ---------------------- Stage 3: Embed & Upsert ----------------------

    upsert_to_pinecone(chunks, paper_ids)


if __name__ == "__main__":
    run_ingestion()