# preprocess_pipeline.py

from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv
from tqdm import tqdm
from PyPDF2 import PdfReader
import io
import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter

# ---------------------- Load environment ----------------------
load_dotenv()
MONGO_URL = os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"

# ---------------------- Semantic Chunking ----------------------
# def split_into_chunks(text, chunk_size=800, overlap=50):
#     chunks, start, text_length = [], 0, len(text)
#     while start < text_length:
#         end = min(start + chunk_size, text_length)
#         chunks.append(text[start:end])
#         start += chunk_size - overlap
#     return chunks


# ---------------------- Fetch PDFs from MongoDB and convert into Chunks----------------------
def preprocess_pdfs_into_chunks():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)

    tiktoken.get_encoding("cl100k_base")  # Example: compatible with GPT-4/Grok

    # Initialize token-based splitter
    token_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=1000,        # 1000 tokens per chunk
        chunk_overlap=250,      # 250 tokens overlap between chunks
        encoding_name="cl100k_base",
        model_name="gpt-4",  # uses tiktoken tokenizer
        separators=["\n\n", "\n", ". ", "? ", "! ", "; ", " "]
    )


    
    new_papers = list(papers_collection.find({"pinecone_indexed": {"$ne": True}}))
    if len(new_papers) == 0:
        print("⚠️ No new papers to process!")
        return [], []
    all_chunks, paper_ids = [], []
    for paper in tqdm(new_papers, desc="Processing new papers"):
        try:
            file_id = paper.get("file_id")
            if not file_id:
                continue

            pdf_bytes = fs.get(file_id).read()
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())


            if not text.strip():
                print(f"⚠️ Empty PDF: {paper['arxiv_id']}")
                continue

            chunks = token_splitter.split_text(text)
            for i, chunk in enumerate(chunks):
                all_chunks.append({
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                    "chunk": chunk,
                    "chunk_index": i
                })
            paper_ids.append(paper["arxiv_id"])
        except Exception as e:
            print(f"❌ Error processing {paper['arxiv_id']}: {e}")

    client.close()
    return all_chunks, paper_ids

# ---------------------- Main ----------------------
if __name__ == "__main__":

    chunks,ids = preprocess_pdfs_into_chunks()
    if chunks:
        # Print first 2 chunks for verification
        print("\n--- Sample Chunks ---")
        for c in chunks[:2]:
            print(f"Title: {c['title']}\nChunk:\n{c['chunk'][:500]}...\n")
    else:
        print("⚠️ No chunks generated.")
