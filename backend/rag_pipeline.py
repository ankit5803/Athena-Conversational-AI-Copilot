# rag_pipeline.py
import re
import os
import concurrent.futures
from dotenv import load_dotenv
from mongodb import upload_to_mongo, extract_tags, expand_tags
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from pinecone_ingestion import run_ingestion
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

# ===== Load environment variables =====
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "arxiv-papers"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ===== Initialize Pinecone =====
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# ===== Load embedding model (same as used in upsert) =====
embed_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# ===== Initialize OpenRouter Client =====
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# ===== Initialize BLIP (image captioning) =====
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def get_caption_from_image(image_path):
    """Generate a descriptive caption for a given image."""
    image = Image.open(image_path)
    inputs = processor(images=image, return_tensors="pt")
    out = blip_model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

# ===== Text cleaning for retrieved chunks =====
def clean_chunk(text):
    text = re.sub(r'https?://\S+', '', text)  # Remove URLs
    text = re.sub(r'\[\d+(,\s*\d+)*\]', '', text)  # Remove citations
    text = re.sub(r'\s+', ' ', text)  # Fix spacing
    text = re.sub(r'\b\w{1,3}$', '', text)  # Trim incomplete words (optional)
    return text.strip()

# ===== Background ingestion =====
def background_ingestion(query, top_n_per_tag=2):
    tags = extract_tags(query)
    expanded_tags = expand_tags(tags)
    for tag in expanded_tags[:10]:
        upload_to_mongo(tag, top_n_per_tag)
    run_ingestion()
    print("✅ Background ingestion completed.")

# ===== RAG main function =====
def rag_query(query, top_k=5, max_new_tokens=300, threshold=0.2):
    # Step 1: Embed the query
    query_embedding = embed_model.encode([query]).tolist()

    # Step 2: Search Pinecone
    results = index.query(
        vector=query_embedding[0],
        top_k=top_k,
        include_metadata=True
    )
    matches = results.get("matches", [])
    print(matches[0]["score"] if matches else "No matches found")

    # Step 3: Handle low relevance
    if not matches or matches[0]["score"] < threshold:
        print("⚠️ Low relevance in Pinecone. Triggering ingestion...")

        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        executor.submit(background_ingestion, query)

        print("The information in the database is limited. Here's a general overview based on my knowledge:")
        results = index.query(vector=query_embedding[0], top_k=top_k, include_metadata=True)
        matches = results.get("matches", [])

    # Step 4: Prepare retrieved context
    contexts = [clean_chunk(match["metadata"]["snippet"]) for match in matches if "metadata" in match and "snippet" in match["metadata"]]
    context_text = "\n\n".join([c for c in contexts if c.strip()])

    # Step 5: Build prompt
    prompt = f"""You are a helpful assistant. Use the context below to answer the question.
- Ignore URLs or incomplete references.
- If the context does not fully answer the question or is too academic, provide a basic overview from your own knowledge.

Context:
{context_text}

Question: {query}
Answer:"""

    # Step 6: Generate with Grok-4 Fast via OpenRouter
    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": "You are a knowledgeable assistant for answering questions using provided context."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_new_tokens,
        temperature=0.4,
    )
    return completion.choices[0].message.content

# ====== Input Loop (Text or Image) ======
if __name__ == "__main__":
    while True:
        user_input = input("\n📥 Enter a query or image path (or type 'exit'): ")

        if user_input.lower() in ["exit", "quit", "q"]:
            break

        # If image file, generate caption first
        if user_input.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
            try:
                caption = get_caption_from_image(user_input)
                print(f"🖼️ Generated caption from image: {caption}")
                query = caption
            except Exception as e:
                print(f"❌ Failed to process image: {e}")
                continue
        else:
            query = user_input

        # Run the RAG query
        answer = rag_query(query, top_k=10, max_new_tokens=1000, threshold=0.5)
        print("\n🧠 Answer:\n", answer)
