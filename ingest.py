import requests
from xml.etree import ElementTree as ET
import os


BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
PDF_BASE = "https://www.ncbi.nlm.nih.gov/pmc/articles/"

def search_pubmed(query, max_results=5):
    """Search PubMed and return list of IDs"""
    url = f"{BASE_URL}esearch.fcgi?db=pubmed&term={query}&retmax={max_results}&retmode=json"
    response = requests.get(url)
    data = response.json()
    return data["esearchresult"]["idlist"]
    # return data

def fetch_pubmed_details(id_list, output_folder="data"):
    """Fetch metadata + abstract + try to download PDF from PMC"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    ids = ",".join(id_list)
    url = f"{BASE_URL}efetch.fcgi?db=pubmed&id={ids}&retmode=xml"
    response = requests.get(url)
    
    root = ET.fromstring(response.content)
    papers = []
    
    for article in root.findall(".//PubmedArticle"):
        title = article.findtext(".//ArticleTitle", default="No title")
        abstract = " ".join([a.text for a in article.findall(".//AbstractText") if a.text])
        
        authors = []
        for author in article.findall(".//Author"):
            last = author.findtext("LastName")
            first = author.findtext("ForeName")
            if last and first:
                authors.append(f"{first} {last}")
        
        # PMID
        pmid = article.findtext(".//PMID", default=None)
        
        # Try to get PMCID
        pmcid = None
        for id_elem in article.findall(".//ArticleId"):
            if id_elem.attrib.get("IdType") == "pmc":
                pmcid = id_elem.text.replace("PMC", "")
        
        pdf_path = None
        if pmcid:
            pdf_url = f"{PDF_BASE}PMC{pmcid}/pdf/"
            try:
                pdf_response = requests.get(pdf_url)
                if pdf_response.status_code == 200 and pdf_response.headers["Content-Type"] == "application/pdf":
                    safe_title = title.replace(" ", "_").replace("/", "_")[:50]
                    pdf_path = os.path.join(output_folder, f"{safe_title}.pdf")
                    with open(pdf_path, "wb") as f:
                        f.write(pdf_response.content)
                    print(f"📥 Downloaded PDF: {pdf_path}")
            except Exception as e:
                print(f"⚠️ Could not fetch PDF for {title}: {e}")
        papers.append({
            "pmid": pmid,
            "title": title,
            "abstract": abstract,
            "authors": authors,
            "pmcid": pmcid,
            "pdf_path": pdf_path
        })
        
    return papers


if __name__ == "__main__":
    query = "Cancer"
    ids = search_pubmed(query, max_results=5)
    print(f"📌 Found PubMed IDs: {ids}")
    
    papers = fetch_pubmed_details(ids)
    for p in papers:
        print("\n🔹 Title:", p["title"])
        print("Authors:", ", ".join(p["authors"]))
        print("Abstract:", p["abstract"][:250], "...")
        print("PMID:", p["pmid"], "| PMCID:", p["pmcid"])
        print("PDF:", p["pdf_path"])
