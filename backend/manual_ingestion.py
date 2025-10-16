#manualingestion.py
from mongodb import upload_to_mongo, extract_tags, expand_tags
from pinecone_ingestion import run_ingestion

if __name__ == "__main__":
    topic = input("Enter topic to ingest : ")
    tags = extract_tags(topic)
    print(f"🔖 Extracted tags: {tags}")
    expanded_tags = expand_tags(tags)
    print(f"🔖 Expanded tags: {expanded_tags}")
    for tag in expanded_tags:
        upload_to_mongo(tag,2)
    run_ingestion()