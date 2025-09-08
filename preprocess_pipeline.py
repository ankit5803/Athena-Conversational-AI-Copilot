# preprocessed_pipeline.py
from pymongo import MongoClient
import gridfs
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"

# Chunking settings
CHUNK_SIZE = 800
CHUNK_OVERLAP = 50

def fetch_pdfs_from_mongo():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)

    pdfs = []
    for paper in papers_collection.find():
        file_id = paper["file_id"]
        pdf_content = fs.get(file_id).read()
        pdfs.append({
            "arxiv_id": paper["arxiv_id"],
            "title": paper["title"],
            "content": pdf_content
        })
    client.close()
    return pdfs

def extract_text_from_pdf(pdf_bytes):
    from io import BytesIO
    from PyPDF2 import PdfReader

    reader = PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def preprocess_and_embed(pdfs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, 
        chunk_overlap=CHUNK_OVERLAP
    )

    embeddings_model = OpenAIEmbeddings()  # make sure OPENAI_API_KEY is in .env

    embedded_chunks = []

    for paper in pdfs:
        text = extract_text_from_pdf(paper["content"])
        chunks = text_splitter.split_text(text)

        for i, chunk in enumerate(chunks, start=1):
            vector = embeddings_model.embed_query(chunk)
            embedded_chunks.append({
                "arxiv_id": paper["arxiv_id"],
                "title": paper["title"],
                "chunk_index": i,
                "chunk_text": chunk,
                "embedding": vector
            })
    return embedded_chunks

if __name__ == "__main__":
    print("Fetching PDFs from MongoDB...")
    pdfs = fetch_pdfs_from_mongo()
    print(f"Fetched {len(pdfs)} papers.")

    print("Processing and generating embeddings...")
    embedded_chunks = preprocess_and_embed(pdfs)
    print(f"✅ Done! Generated {len(embedded_chunks)} embedded chunks.")

    # For testing, just print a sample
    print("--- Sample Embedded Chunk ---")
    print("Title:", embedded_chunks[0]["title"])
    print("Chunk index:", embedded_chunks[0]["chunk_index"])
    print("Text snippet:", embedded_chunks[0]["chunk_text"][:200])
    print("Embedding vector length:", len(embedded_chunks[0]["embedding"]))
