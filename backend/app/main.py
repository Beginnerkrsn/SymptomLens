import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.medical import router as medical_router
from app.api.predictions import router as predictions_router
from app.api.xray import router as xray_router


load_dotenv()


FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "http://localhost:5173",
)


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    FRONTEND_BASE_URL,
]


ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS))


app = FastAPI(
    title="SymptomLens API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix="/api",
)


app.include_router(
    medical_router,
    prefix="/api",
)


app.include_router(
    predictions_router,
    prefix="/api",
)


app.include_router(
    xray_router,
    prefix="/api",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "SymptomLens API",
    }