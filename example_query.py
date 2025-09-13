# example_query.py (after you upsert)
import os
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from dotenv import load_dotenv
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")


model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
pc = Pinecone(api_key=PINECONE_API_KEY)

index = pc.Index("arxiv-papers")

query_text = "recent advances in cancer immunotherapy"
q_emb = model.encode([query_text])[0].tolist()

res = index.query(vector=q_emb, top_k=5, include_metadata=True)
for match in res["matches"]:
    print(match["id"], match["score"], match["metadata"]["snippet"])
