import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.memory.hindsight import hindsight_client
from app.data.historical_incidents import HISTORICAL_INCIDENTS_DATASET
from app.memory.learning_curve import compute_learning_curve
from app.models.schemas import LearningCurveResponse

router = APIRouter(prefix="/api/memories", tags=["memories"])
logger = logging.getLogger("incident_agent.memories")

# Full chronological historical incidents dataset (35 production incidents)
SAMPLE_HISTORICAL_INCIDENTS = HISTORICAL_INCIDENTS_DATASET

def get_sample_memory_items() -> List[Dict[str, Any]]:
    items = []
    for inc in SAMPLE_HISTORICAL_INCIDENTS:
        succ_str = "\n".join([f"  ✓ {f}" for f in inc.get("successful_fixes", [])])
        fail_str = "\n".join([f"  ✕ {f}" for f in inc.get("failed_fixes", [])])
        inc_date = inc.get("date", "2026-09-27T10:00:00Z")
        inc_date_display = inc.get("date_display", inc_date[:10])
        
        memory_content = (
            f"HISTORICAL INCIDENT REPORT [ID: {inc['id']}]\n"
            f"Date: {inc_date}\n"
            f"Date Display: {inc_date_display}\n"
            f"Affected Service: {inc['service']}\n"
            f"Severity: {inc['severity']}\n"
            f"Environment: {inc['environment']}\n"
            f"Title: {inc['title']}\n\n"
            f"Symptoms & Error Signatures:\n{inc['symptoms']}\n\n"
            f"Diagnostic Information:\n{inc['diagnostic_info']}\n\n"
            f"Recent Deployment/Change:\n{inc['recent_deployment']}\n\n"
            f"VERIFIED ROOT CAUSE:\n{inc['root_cause']}\n\n"
            f"SUCCESSFUL FIXES:\n{succ_str}\n\n"
            f"FAILED FIXES TO AVOID:\n{fail_str}\n\n"
            f"RESOLVED MITIGATION & REMEDIATION APPLIED:\n{inc['resolution']}\n\n"
            f"OUTCOME:\n{inc['outcome']}\n\n"
            f"Resolution Duration: {inc['duration_minutes']} minutes | Resolved By: {inc['resolved_by']}"
        )
        items.append({
            "id": inc["id"],
            "title": inc.get("title", ""),
            "severity": inc.get("severity", "P2 - High"),
            "environment": inc.get("environment", "production"),
            "symptoms": inc.get("symptoms", ""),
            "diagnostic_info": inc.get("diagnostic_info", ""),
            "recent_deployment": inc.get("recent_deployment", ""),
            "root_cause": inc.get("root_cause", ""),
            "resolution": inc.get("resolution", ""),
            "outcome": inc.get("outcome", ""),
            "resolved_by": inc.get("resolved_by", ""),
            "duration_minutes": inc.get("duration_minutes", 30),
            "content": memory_content,
            "text": memory_content,
            "fact_type": "experience",
            "type": "experience",
            "tags": inc["tags"],
            "timestamp": inc_date,
            "service": inc["service"],
            "successful_fixes": inc.get("successful_fixes", []),
            "failed_fixes": inc.get("failed_fixes", []),
            "date": inc_date,
            "date_display": inc_date_display
        })
    return items


@router.get("/learning-curve", response_model=LearningCurveResponse)
async def get_learning_curve():
    """
    Computes data-driven learning curve over the chronological historical incidents dataset.
    Evaluates incident resolution recommendation success and failed-fix avoidance across batches.
    """
    return compute_learning_curve(SAMPLE_HISTORICAL_INCIDENTS)

@router.get("", response_model=Dict[str, Any])
async def get_all_memories():
    """
    Fetch all persistent memories stored in Hindsight Cloud bank 'unicase-incident-memory'.
    Falls back gracefully to baseline historical incidents if Hindsight Cloud is empty or offline.
    """
    sample_items = get_sample_memory_items()
    try:
        data = await hindsight_client.list_memories(limit=50)
        items = data.get("items", [])
        if items and len(items) > 0:
            return data
        # If cloud bank is currently empty, return baseline historical items
        return {
            "total": len(sample_items),
            "items": sample_items,
            "bank_id": hindsight_client.bank_id,
            "source": "baseline_cache"
        }
    except Exception as e:
        logger.warning(f"Could not fetch memories from Hindsight Cloud: {e}. Falling back to baseline incidents.")
        return {
            "total": len(sample_items),
            "items": sample_items,
            "bank_id": hindsight_client.bank_id,
            "source": "baseline_cache",
            "notice": f"Hindsight Cloud sync note: {str(e)}"
        }

@router.post("/load-history", response_model=Dict[str, Any])
@router.post("/seed", response_model=Dict[str, Any])
async def load_historical_incidents():
    """
    Load real historical incident postmortems into Hindsight Cloud bank 'unicase-incident-memory'.
    Performs real Hindsight Cloud RETAIN operations and guarantees baseline data for the knowledge graph.
    """
    results = []
    retained_count = 0
    for inc in SAMPLE_HISTORICAL_INCIDENTS:
        try:
            res = await hindsight_client.retain(
                incident_id=inc["id"],
                title=inc["title"],
                service=inc["service"],
                severity=inc["severity"],
                environment=inc["environment"],
                symptoms=inc["symptoms"],
                diagnostic_info=inc["diagnostic_info"],
                recent_deployment=inc["recent_deployment"],
                root_cause=inc["root_cause"],
                resolution=inc["resolution"],
                outcome=inc["outcome"],
                resolved_by=inc["resolved_by"],
                duration_minutes=inc["duration_minutes"],
                tags=inc["tags"]
            )
            success = res.get("success", False)
            if success:
                retained_count += 1
            results.append({
                "incident_id": inc["id"],
                "title": inc["title"],
                "retained": success
            })
        except Exception as e:
            results.append({
                "incident_id": inc["id"],
                "title": inc["title"],
                "retained": False,
                "error": str(e)
            })

    return {
        "message": f"Historical incidents processed ({retained_count}/{len(SAMPLE_HISTORICAL_INCIDENTS)} retained in Hindsight Cloud).",
        "retained_count": retained_count,
        "total_available": len(SAMPLE_HISTORICAL_INCIDENTS),
        "results": results
    }
