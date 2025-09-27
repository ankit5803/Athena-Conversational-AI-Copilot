from pymongo import MongoClient
import requests
import gridfs
from dotenv import load_dotenv
import os
import feedparser

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI")  # Atlas URI from .env
DB_NAME = "arxiv_db"
COLLECTION_NAME = "papers"


def fetch_arxiv(query="machine learning", max_results=5):
    """
    Fetch metadata from arXiv based on query.
    Returns a list of dicts with arxiv_id, title, abstract, and pdf_url.
    """
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

        # ✅ Extract base arXiv ID (remove version suffix like v2)
        arxiv_id_full = entry.id.split("/")[-1]  # e.g., "2409.12345v2"
        arxiv_id = arxiv_id_full.split("v")[0]   # e.g., "2409.12345"

        pdf_url = None
        for link in entry.links:
            if link.rel == "alternate":
                continue
            if link.type == "application/pdf":
                pdf_url = link.href
                break

        if pdf_url:
            articles.append({
                "arxiv_id": arxiv_id,   # ✅ only base id
                "title": title,
                "abstract": abstract,
                "pdf_url": pdf_url
            })

    return articles

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