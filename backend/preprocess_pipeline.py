import os
import io
import gridfs
from pymongo import MongoClient
from dotenv import load_dotenv
from tqdm import tqdm
from PyPDF2 import PdfReader
import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter
from groq import Groq

# ---------------------- Load environment ----------------------
load_dotenv()
MONGO_URL = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client for document summarization
groq_client = Groq(api_key=GROQ_API_KEY)


def generate_document_summary(text: str) -> str:
    """Uses Groq to generate a concise global summary of the PDF document."""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful research assistant. Provide a concise 2-3 sentence "
                        "summary of the core concepts, problems, and methodologies discussed in this paper."
                    ),
                },
                {
                    "role": "user",
                    "content": text[:15000],  # Fits comfortably within fast context windows
                },
            ],
            temperature=0.2,
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️ Summary generation failed: {e}")
        return "Summary unavailable."


# ---------------------- Fetch PDFs from MongoDB and convert into Chunks ----------------------
def preprocess_pdfs_into_chunks():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)

    # Initialize token-based splitter
    token_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=800,
        chunk_overlap=200,
        encoding_name="cl100k_base",
        model_name="gpt-4",
        separators=["\n\n", "\n", ". ", "? ", "! ", "; ", " "],
    )

    new_papers = list(papers_collection.find({"pinecone_indexed": {"$ne": True}}))
    if len(new_papers) == 0:
        print("⚠️ No new papers to process!")
        client.close()
        return [], []

    all_chunks, paper_ids = [], []
    for paper in tqdm(new_papers, desc="Processing new papers"):
        try:
            file_id = paper.get("file_id")
            if not file_id:
                continue

            pdf_bytes = fs.get(file_id).read()
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = "\n".join(
                page.extract_text() for page in reader.pages if page.extract_text()
            )

            if not text.strip():
                print(f"⚠️ Empty PDF: {paper.get('arxiv_id', 'Unknown')}")
                continue

            # Generate global document summary for Contextual Retrieval
            paper_title = paper.get("title", "Untitled Document")
            arxiv_id = paper.get("arxiv_id", "unknown_id")
            print(f"\n🧠 Generating contextual summary for: {paper_title}")
            global_summary = generate_document_summary(text)

            chunks = token_splitter.split_text(text)
            for i, chunk in enumerate(chunks):
                # Prepend title and global summary to enrich standalone chunk embeddings
                enriched_chunk = (
                    f"DOCUMENT TITLE: {paper_title}\n"
                    f"DOCUMENT SUMMARY: {global_summary}\n\n"
                    f"CHUNK CONTENT:\n{chunk}"
                )

                all_chunks.append({
                    "arxiv_id": arxiv_id,
                    "title": paper_title,
                    "chunk": enriched_chunk,
                    "chunk_index": i,
                })
            paper_ids.append(arxiv_id)
        except Exception as e:
            print(f"❌ Error processing {paper.get('arxiv_id')}: {e}")

    client.close()
    return all_chunks, paper_ids


# ---------------------- Main ----------------------
if __name__ == "__main__":
    chunks, ids = preprocess_pdfs_into_chunks()
    if chunks:
        print("\n--- Sample Contextual Chunks ---")
        for c in chunks[:2]:
            print(f"Title: {c['title']}\nChunk Preview:\n{c['chunk'][:400]}...\n")
    else:
        print("⚠️ No chunks generated.")