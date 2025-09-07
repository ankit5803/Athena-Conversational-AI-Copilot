import requests
import feedparser
import os
import time

# Folder to save PDFs
PDF_DIR = "pdfs"
os.makedirs(PDF_DIR, exist_ok=True)

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


def download_pdf(pdf_url, filename):
    """Download PDF and save locally."""
    try:
        response = requests.get(pdf_url, stream=True)
        response.raise_for_status()
        filepath = os.path.join(PDF_DIR, filename)
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                f.write(chunk)
        print(f"✅ Saved PDF: {filepath}")
    except Exception as e:
        print(f"❌ Failed to download {pdf_url}: {e}")

if __name__ == "__main__":
    query = "machine learning"
    articles = fetch_arxiv(query, max_results=10)

    print("\nFetched Articles:")
    for i, art in enumerate(articles, start=1):
        print(f"\n{i}. {art['title']}")
        print(f"Abstract: {art['abstract'][:300]}...")  # show first 300 chars
        print(f"PDF: {art['pdf_url']}")

        # Save PDF
        filename = f"arxiv_{i}.pdf"
        download_pdf(art["pdf_url"], filename)

        time.sleep(1)  # Be polite to arXiv servers
