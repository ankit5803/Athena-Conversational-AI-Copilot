#app.py
from fastapi import FastAPI,HTTPException
from rag_pipeline import rag_query
from pydantic import BaseModel

app = FastAPI(title="Athena Conversational AI Backend", version="1.0.0")
class QueryRequest(BaseModel):
    query: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}


# ===== Request model =====

# ===== Fixed search endpoint =====
@app.post("/search")
async def query_endpoint(request: QueryRequest):
    try:
        response = rag_query(request.query,10,1000,0.5)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))