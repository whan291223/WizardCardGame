from fastapi import FastAPI
from app.api.endpoints import router as api_router
from app.core.db import init_db

app = FastAPI(title="Wizard Game API")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Wizard Game API"}
