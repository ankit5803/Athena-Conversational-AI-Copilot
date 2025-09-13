# preprocess_pipeline.py

from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv
from tqdm import tqdm
from PyPDF2 import PdfReader
import json

# ---------------------- Load environment ----------------------
load_dotenv()
MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"

# ---------------------- Semantic Chunking ----------------------
def split_into_chunks(text, chunk_size=800, overlap=50):
    """
    Splits text into overlapping chunks.
    """
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# ---------------------- Fetch PDFs from MongoDB ----------------------
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
                print(f"⚠️ No file_id for paper {paper.get('arxiv_id')}")
                continue

            pdf_bytes = fs.get(file_id).read()
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            # Skip empty PDFs
            if not text.strip():
                print(f"⚠️ Empty PDF: {paper.get('arxiv_id')}")
                continue

            # Split text into chunks
            chunks = split_into_chunks(text)
            # Save metadata for each chunk
            for chunk in chunks:
                all_chunks.append({
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                    "chunk": chunk
                })

        except Exception as e:
            print(f"❌ Error processing {paper.get('arxiv_id')}: {e}")

    client.close()
    return all_chunks

# ---------------------- Main ----------------------
if __name__ == "__main__":
    import io

    chunks = fetch_pdfs_from_mongo()
    if chunks:
        with open("preprocessed_chunks.json", "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        print(f"✅ Preprocessing complete! {len(chunks)} chunks saved to preprocessed_chunks.json")

        # Print first 2 chunks for verification
        print("\n--- Sample Chunks ---")
        for c in chunks[:2]:
            print(f"Title: {c['title']}\nChunk:\n{c['chunk'][:500]}...\n")
    else:
        print("⚠️ No chunks generated.")
