from fastapi import FastAPI,HTTPException
from rag_pipeline import rag_query
from pydantic import BaseModel
from starlette.responses import StreamingResponse
import json

app = FastAPI(title="Athena Conversational AI Backend", version="1.0.0")
class QueryRequest(BaseModel):
    query: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}


# ===== Fixed search endpoint =====
@app.post("/search")
async def stream_search(request: QueryRequest):

    async def event_stream():
        # yield tokens as they arrive
        for chunk in rag_query(request.query, top_k=10, max_new_tokens=1000, threshold=0.5):
            if chunk:
                data = json.dumps({"delta": chunk})
                yield f"data: {data}\n\n"
                
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# @app.post("/search")
# async def query_endpoint(request: QueryRequest):
#     try:
#         response = rag_query(request.query,10,1000,0.5)
#         return {"response": response}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))