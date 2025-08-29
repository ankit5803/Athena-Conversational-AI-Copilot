import requests
import xml.etree.ElementTree as ET
import time

# Base URLs for PubMed and PubMed Central
BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
EMAIL = "ankitbarik03@gmail.com"  # Required for NCBI API (use a valid one!)

def fetch_pmids(query, retmax=5):
    """Fetch PMIDs from PubMed based on a query."""
    url = f"{BASE_URL}esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "xml",
        "retmax": retmax,
        "email": EMAIL
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    root = ET.fromstring(response.text)
    pmids = [id_elem.text for id_elem in root.findall(".//Id")]
    return pmids

def fetch_article_details(pmids):
    """Fetch article details and filter only those with PDFs available."""
    url = f"{BASE_URL}efetch.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "email": EMAIL
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    root = ET.fromstring(response.text)

    articles = []
    for article in root.findall(".//PubmedArticle"):
        pmid = article.findtext(".//PMID")

        # Try to fetch PMC ID
        article_ids = article.findall(".//ArticleId")
        pmcid = None
        for aid in article_ids:
            if aid.attrib.get("IdType") == "pmc":
                pmcid = aid.text
                break

        # Only keep articles if they have a PMC ID (since PDFs are only in PMC)
        if not pmcid:
            continue

        title = article.findtext(".//ArticleTitle", default="No Title")
        abstract = " ".join([abst.text for abst in article.findall(".//AbstractText") if abst.text])
        pdf_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/pdf/"

        articles.append({
            "pmid": pmid,
            "pmcid": pmcid,
            "title": title,
            "abstract": abstract,
            "pdf_url": pdf_url
        })

    return articles

if __name__ == "__main__":
    query = "machine learning cancer"
    pmids = fetch_pmids(query, retmax=10)
    print("Fetched PMIDs:", pmids)

    time.sleep(1)  # Respect NCBI API rate limit

    articles = fetch_article_details(pmids)
    print("\nArticles with PDFs:")
    for art in articles:
        print(art)
