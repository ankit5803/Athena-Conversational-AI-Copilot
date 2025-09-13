# upsert_to_pinecone.py
import os
import json
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

# ===== CONFIG =====
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"
DIMENSION = 768  # all-mpnet-base-v2 -> 768 dims. See model docs.
BATCH_SIZE = 64

if not PINECONE_API_KEY:
    raise ValueError("❌ Pinecone API key not found. Set PINECONE_API_KEY in .env")

# ===== Load preprocessed chunks =====
with open("preprocessed_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)  # list of {"arxiv_id","title","chunk"}

if not chunks:
    print("No chunks found in preprocessed_chunks.json")
    raise SystemExit(0)

# ===== Load sentence-transformers model =====
model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# ===== Initialize Pinecone client (new SDK style) =====
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn’t exist
if INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

# Connect to the index
index = pc.Index(INDEX_NAME)

# ===== Helper: batching =====
def batch(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i+n]

print(f"Generating embeddings for {len(chunks)} chunks and upserting to Pinecone index '{INDEX_NAME}'...")

# enumerate chunks and create unique ids
entries = []
for idx, item in enumerate(chunks, start=1):
    arxiv_id = item.get("arxiv_id")
    title = item.get("title", "")
    text = item.get("chunk", "")
    unique_id = f"{arxiv_id}_chunk{idx}"
    entries.append({
        "id": unique_id,
        "text": text,
        "metadata": {
            "arxiv_id": arxiv_id,
            "title": title,
            "chunk_index": idx,
            "snippet": text[:300]
        }
    })

# ===== Compute embeddings and upsert in batches =====
for batch_items in tqdm(list(batch(entries, BATCH_SIZE)), desc="Upserting batches"):
    texts = [e["text"] for e in batch_items]
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)

    vectors = []
    for e, emb in zip(batch_items, embeddings):
        vectors.append({
            "id": e["id"],
            "values": emb.tolist(),
            "metadata": e["metadata"]
        })

    index.upsert(vectors=vectors)

print("✅ Upsert complete.")
