import requests
import xml.etree.ElementTree as ET
import time

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

# Function to search PubMed and return list of PMIDs
def search_pubmed(query, max_results=5):
    url = f"{BASE_URL}esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "xml"
    }
    response = requests.get(url, params=params)
    time.sleep(1)  # ✅ Prevent hitting API rate limit
    response.raise_for_status()
    root = ET.fromstring(response.text)
    ids = [id_elem.text for id_elem in root.findall(".//Id")]
    return ids


# Function to fetch details for given PMIDs
def fetch_pubmed_details(id_list):
    if not id_list:
        return []
    
    url = f"{BASE_URL}efetch.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "xml"
    }
    response = requests.get(url, params=params)
    time.sleep(1)  # ✅ Be nice to PubMed servers
    response.raise_for_status()
    root = ET.fromstring(response.text)

    papers = []
    for article in root.findall(".//PubmedArticle"):
        pmid_elem = article.find(".//PMID")
        title_elem = article.find(".//ArticleTitle")
        abstract_elem = article.find(".//Abstract/AbstractText")

        pmid = pmid_elem.text if pmid_elem is not None else None
        title = title_elem.text if title_elem is not None else None
        abstract = abstract_elem.text if abstract_elem is not None else None

        papers.append({
            "pmid": pmid,
            "title": title,
            "abstract": abstract
        })
    
    return papers


# Example usage
if __name__ == "__main__":
    query = "Cancer"
    ids = search_pubmed(query, max_results=6)
    papers = fetch_pubmed_details(ids)

    for paper in papers:
        print(f"PMID: {paper['pmid']}")
        print(f"Title: {paper['title']}")
        print(f"Abstract: {paper['abstract']}\n")
