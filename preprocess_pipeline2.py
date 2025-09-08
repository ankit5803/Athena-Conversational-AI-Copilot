# test_preprocess_hf.py

import os
import io
from tqdm import tqdm
from pymongo import MongoClient
import gridfs
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# ---------------------- Load environment ----------------------
load_dotenv()
MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"

# ---------------------- Chunking function ----------------------
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

# ---------------------- Fetch PDFs from Mongo ----------------------
def fetch_pdfs_from_mongo():
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

            if text.strip():
                chunks = split_into_chunks(text)
                all_chunks.extend(chunks)

        except Exception as e:
            print(f"❌ Error processing {paper.get('arxiv_id')}: {e}")

    client.close()
    return all_chunks

# ---------------------- Test embeddings ----------------------
if __name__ == "__main__":
    chunks = fetch_pdfs_from_mongo()
    if not chunks:
        print("⚠️ No chunks generated. Exiting.")
        exit()

    print(f"✅ Fetched {len(chunks)} chunks. Generating embeddings...")

    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    embeddings = model.encode(chunks[:5], show_progress_bar=True)  # test first 5 chunks

    print("✅ Embeddings generated for first 5 chunks!")
    print("Example embedding vector length:", len(embeddings[0]))
