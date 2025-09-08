from pymongo import MongoClient
import gridfs
from ingestpdf import fetch_arxiv
import requests
from io import BytesIO
from PyPDF2 import PdfReader
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"

def download_and_store_pdf(query="AI", max_results=1):
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    
    # Ensure unique index on arxiv_id
    papers_collection.create_index("arxiv_id", unique=True)
    fs = gridfs.GridFS(db)
    
    articles = fetch_arxiv(query, max_results)
    
    for paper in articles:
        try:
            # Skip if already in DB
            if papers_collection.find_one({"arxiv_id": paper["arxiv_id"]}):
                print(f"⚠️ Duplicate found, skipping: {paper['title']}")
                continue
            
            # Download PDF
            response = requests.get(paper["pdf_url"], stream=True)
            response.raise_for_status()
            pdf_content = response.content
            
            # Store PDF in GridFS
            file_id = fs.put(pdf_content, filename=f"{paper['arxiv_id']}.pdf")
            
            # Save metadata
            paper_doc = {
                "arxiv_id": paper["arxiv_id"],
                "title": paper["title"],
                "abstract": paper["abstract"],
                "pdf_url": paper["pdf_url"],
                "file_id": file_id
            }
            papers_collection.insert_one(paper_doc)
            print(f"✅ Stored PDF: {paper['title']}")
            
        except Exception as e:
            print(f"❌ Error: {paper['title']}: {e}")
    
    client.close()

def fetch_pdf_from_mongo(arxiv_id):
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    fs = gridfs.GridFS(db)
    
    paper_doc = db[COLLECTION_NAME].find_one({"arxiv_id": arxiv_id})
    if not paper_doc:
        print("❌ Paper not found in MongoDB")
        return None
    
    pdf_file = fs.get(paper_doc["file_id"])
    pdf_bytes = pdf_file.read()
    
    client.close()
    return pdf_bytes

def extract_text_from_pdf(pdf_bytes):
    pdf_reader = PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def create_semantic_chunks(text, chunk_size=500):
    chunks = []
    words = text.split()
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
    return chunks

if __name__ == "__main__":
    # Step 1: Download and store 1 PDF
    download_and_store_pdf(query="AI", max_results=1)
    
    # Step 2: Fetch the PDF from MongoDB
    arxiv_id = input("Enter the arXiv ID of the paper to fetch: ")
    pdf_bytes = fetch_pdf_from_mongo(arxiv_id)
    if pdf_bytes:
        print("✅ PDF fetched successfully from MongoDB")
        
        # Step 3: Extract text
        text = extract_text_from_pdf(pdf_bytes)
        print(f"Extracted text length: {len(text)} characters")
        
        # Step 4: Create semantic chunks
        chunks = create_semantic_chunks(text, chunk_size=500)
        print(f"Created {len(chunks)} semantic chunks")
        print("Sample chunk:\n", chunks[0])
