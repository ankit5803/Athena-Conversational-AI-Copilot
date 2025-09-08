from pymongo import MongoClient
from ingestpdf import fetch_arxiv
import requests
import gridfs
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI")  # Atlas URI from .env
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"


def upload_to_mongo(query, max_results=5):
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    papers_collection = db[COLLECTION_NAME]

    # Ensure unique index on arxiv_id
    papers_collection.create_index("arxiv_id", unique=True)

    articles = fetch_arxiv(query, max_results)

    fs = gridfs.GridFS(db)  # Initialize GridFS once

    for i, paper in enumerate(articles, start=1):
        try:
            # Check if paper already exists
            if papers_collection.find_one({"arxiv_id": paper["arxiv_id"]}):
                print(f"⚠️ Duplicate found, skipping: {paper['title']} [{paper['arxiv_id']}]")
                continue

            # Download PDF content
            response = requests.get(paper["pdf_url"], stream=True)
            response.raise_for_status()

            # Save PDF into GridFS
            file_id = fs.put(response.content, filename=f"{paper['arxiv_id']}.pdf")

            # Build document
            paper_doc = {
                "arxiv_id": paper["arxiv_id"],
                "title": paper["title"],
                "abstract": paper["abstract"],
                "pdf_url": paper["pdf_url"],
                "file_id": file_id
            }

            # Insert into MongoDB
            papers_collection.insert_one(paper_doc)
            print(f"✅ Inserted: {paper_doc['title']} [{paper_doc['arxiv_id']}]")

        except Exception as e:
            print(f"❌ Error saving {paper['title']} ({paper['arxiv_id']}): {e}")

    client.close()


if __name__ == "__main__":
    upload_to_mongo("AI", 10)