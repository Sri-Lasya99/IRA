import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import incidents, health, memories

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("incident_agent.main")

app = FastAPI(
    title="Incident Response Agent",
    description="Persistent Memory Incident Response & Decision Support Agent powered by Hindsight Cloud & Groq",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(incidents.router)
app.include_router(memories.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {
        "service": "Incident Response Agent API",
        "version": "1.0.0",
        "memory_bank": settings.HINDSIGHT_BANK_ID,
        "llm_model": settings.GROQ_MODEL,
        "docs_url": "/docs"
    }

@app.on_event("startup")
async def on_startup():
    logger.info("==================================================")
    logger.info("Incident Response Agent Backend Initializing...")
    logger.info(f"Target Hindsight Bank: {settings.HINDSIGHT_BANK_ID}")
    logger.info(f"Hindsight Endpoint:   {settings.HINDSIGHT_BASE_URL}")
    logger.info(f"Groq LLM Model:       {settings.GROQ_MODEL}")
    logger.info("==================================================")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
