from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.memory.hindsight import hindsight_client
from app.llm.groq_client import groq_llm

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("", response_model=HealthResponse)
async def check_health():
    """
    Check live connectivity to:
    1. Hindsight Cloud (and memory bank 'unicase-incident-memory')
    2. Groq LLM API
    """
    hindsight_status = await hindsight_client.health_check()
    groq_status = groq_llm.health_check()

    overall_ok = hindsight_status.get("connected", False) and groq_status.get("connected", False)

    return HealthResponse(
        status="healthy" if overall_ok else "degraded",
        hindsight_cloud=hindsight_status,
        groq_api=groq_status,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
