from fastapi import FastAPI
from app.modules.auth.router import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Backend działa!"}