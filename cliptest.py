from sentence_transformers import SentenceTransformer, util
from PIL import Image

# ===== 1. Load CLIP model =====
model = SentenceTransformer("clip-ViT-B-32")  # lightweight and supports both text+image

# ===== 2. Sample data =====
texts = [
    "A cute dog playing in the park",
    "A spaceship flying through space",
    "A bowl of pasta with tomato sauce"
]

# Replace with your own image files (download a few .jpg/.png)
image_paths = [
    "dog.jpeg",
    "rocket.jpeg",
    "pasta.jpeg"
]

# ===== 3. Encode text and image embeddings =====
text_embs = model.encode(texts, convert_to_tensor=True)
image_embs = model.encode([Image.open(p) for p in image_paths], convert_to_tensor=True)

# ===== 4. Ask a query =====
query = "animal running on grass"
query_emb = model.encode(query, convert_to_tensor=True)

# ===== 5. Compute similarity =====
text_scores = util.cos_sim(query_emb, text_embs)[0]
image_scores = util.cos_sim(query_emb, image_embs)[0]

# ===== 6. Find best matches =====
best_text_idx = text_scores.argmax()
best_image_idx = image_scores.argmax()

print("\n🔹 Query:", query)
print(f"📝 Best text match: '{texts[best_text_idx]}' (score={text_scores[best_text_idx]:.3f})")
print(f"🖼️ Best image match: '{image_paths[best_image_idx]}' (score={image_scores[best_image_idx]:.3f})")
