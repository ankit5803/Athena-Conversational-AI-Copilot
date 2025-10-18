from rag_pipeline import rag_query

def image_to_query(image_path):


    from transformers import BlipProcessor, BlipForConditionalGeneration
    from PIL import Image
    
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

    image = Image.open(image_path)
    inputs = processor(images=image, return_tensors="pt")
    out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

# Example usage:
image_query = image_to_query("pasta.jpg")
print("Generated caption:", image_query)
answer = rag_query(image_query)
# print(answer)