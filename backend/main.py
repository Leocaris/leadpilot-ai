"""LeadPilot AI — FastAPI application entry point."""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LeadPilot AI API",
    description="AI-powered CRM backend with Gemini integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origins
cors_origins_env = os.getenv("CORS_ORIGINS", "")
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()] if cors_origins_env else []
origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from routes.leads import router as leads_router
from routes.ai_routes import router as ai_router

app.include_router(leads_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


@app.get("/health")
async def health():
    from database import get_database
    from services.ai_service import get_gemini_client
    _, use_demo_db = get_database()
    _, _, use_demo_ai = get_gemini_client()
    return {
        "status": "healthy",
        "database": "demo_mode" if use_demo_db else "mongodb_connected",
        "ai": "demo_mode" if use_demo_ai else "gemini_connected",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


@app.get("/")
async def root():
    return {
        "message": "LeadPilot AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
