# rag_ingest_pipeline.py
import os
import io
import requests
import feedparser
import gridfs
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from PyPDF2 import PdfReader
from tqdm import tqdm
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

# ---------------------- Semantic Chunking ----------------------
def split_into_chunks(text, chunk_size=800, overlap=50):
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# ---------------------- Stage 1: Fetch & Store Papers ----------------------
def fetch_arxiv(query="machine learning", max_results=5):
    base_url = "http://export.arxiv.org/api/query"
    params = {
        "search_query": query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending"
    }

    response = requests.get(base_url, params=params)
    response.raise_for_status()
    feed = feedparser.parse(response.text)

    articles = []
    for entry in feed.entries:
        title = entry.title
        abstract = entry.summary.replace("\n", " ").strip()

        # base arXiv ID only
        arxiv_id_full = entry.id.split("/")[-1]
        arxiv_id = arxiv_id_full.split("v")[0]

        pdf_url = None
        for link in entry.links:
            if link.type == "application/pdf":
                pdf_url = link.href
                break

        if pdf_url:
            articles.append({
                "arxiv_id": arxiv_id,
                "title": title,
                "abstract": abstract,
                "pdf_url": pdf_url
            })
    return articles

def upload_to_mongo(query, max_results=5):
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)

    papers_collection.create_index("arxiv_id", unique=True)
    articles = fetch_arxiv(query, max_results)

    for paper in articles:
        if papers_collection.find_one({"arxiv_id": paper["arxiv_id"]}):
            print(f"⚠️ Duplicate found, skipping: {paper['title']} [{paper['arxiv_id']}]")
            continue

        try:
            response = requests.get(paper["pdf_url"], stream=True)
            response.raise_for_status()

            file_id = fs.put(response.content, filename=f"{paper['arxiv_id']}.pdf")

            paper_doc = {
                "arxiv_id": paper["arxiv_id"],
                "title": paper["title"],
                "abstract": paper["abstract"],
                "pdf_url": paper["pdf_url"],
                "file_id": file_id
            }

            papers_collection.insert_one(paper_doc)
            print(f"✅ Inserted: {paper['title']} [{paper['arxiv_id']}]")
        except Exception as e:
            print(f"❌ Error saving {paper['title']} ({paper['arxiv_id']}): {e}")

    client.close()

# ---------------------- Stage 2: Preprocess PDFs ----------------------
def preprocess_pdfs():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)

    all_chunks = []
    papers = list(papers_collection.find({}))
    if not papers:
        print("⚠️ No papers found in MongoDB!")
        return []

    for paper in tqdm(papers, desc="Processing papers"):
        try:
            file_id = paper.get("file_id")
            if not file_id:
                continue

            pdf_bytes = fs.get(file_id).read()
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                print(f"⚠️ Empty PDF: {paper['arxiv_id']}")
                continue

            chunks = split_into_chunks(text)
            for chunk in chunks:
                all_chunks.append({
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                    "chunk": chunk
                })
        except Exception as e:
            print(f"❌ Error processing {paper['arxiv_id']}: {e}")

    client.close()
    return all_chunks

# ---------------------- Stage 3: Embed & Upsert to Pinecone ----------------------
def upsert_to_pinecone(chunks):
    if not PINECONE_API_KEY:
        raise ValueError("❌ Pinecone API key not found in .env")

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

    print(f"Generating embeddings for {len(chunks)} chunks and upserting to Pinecone index '{INDEX_NAME}'...")


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

# ---------------------- Main Pipeline ----------------------
if __name__ == "__main__":
    print("\n🚀 Stage 1: Fetching papers from arXiv and uploading to MongoDB...")
    upload_to_mongo("AI", 5)

    print("\n🚀 Stage 2: Preprocessing PDFs into chunks...")
    chunks = preprocess_pdfs()

    if chunks:
        print("\n🚀 Stage 3: Creating embeddings and uploading to Pinecone...")
        upsert_to_pinecone(chunks)
    else:
        print("⚠️ No chunks to process. Pipeline stopped.")
