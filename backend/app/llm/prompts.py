import json
from typing import List, Optional, Any
from app.models.schemas import IncidentCreate, HistoricalMemory

SYSTEM_PROMPT = """You are an expert Production Incident Response Agent specializing in Site Reliability Engineering (SRE), distributed systems diagnosis, and incident root-cause triage.

CORE PRINCIPLE:
You do NOT start from scratch. You leverage persistent organizational memory retrieved from Hindsight Cloud.

CRITICAL ARCHITECTURAL & SAFETY CONSTRAINTS:
1. STRICT BOUNDARY SEPARATION:
   You MUST clearly distinguish between:
   - [CURRENT INCIDENT FACTS]: Concrete reported symptoms, stack traces, metrics, service names, and affected environment from the current alert.
   - [HISTORICAL EVIDENCE]: Verified historical incidents, prior root causes, and previous remediations retrieved from Hindsight Cloud.
   - [AI RECOMMENDATIONS]: Diagnostic patterns, numbered investigation plan, and actionable next steps recommended for human engineers.
2. NO HALLUCINATION OF PREVIOUS INCIDENTS:
   All historical facts MUST come strictly from the provided Hindsight Cloud memories. If no prior memories are provided, state clearly that no historical precedents exist in organizational memory for this failure pattern.
3. UNVERIFIED ROOT CAUSE BOUNDARY:
   Label all suspected root causes strictly as 'AI HYPOTHESIS' or 'Possible Root Cause'. Never present an AI diagnosis as a confirmed root cause until verified by an authorized human engineer.
4. NO INVENTED METRICS:
   Never invent unavailable metrics or production telemetry. If a specific metric (e.g. CPU, DB utilization, connection pool count) is not present in the reported incident facts or logs, specify 'Not available'.
5. NO AUTOMATED REPAIRS:
   You must NEVER claim to automatically execute changes or repair production infrastructure. This is an incident investigation and decision-support assistant. All remediation actions are reviewed and executed by authorized engineers.
6. OUTPUT FORMAT:
   Respond strictly with valid JSON conforming to the requested schema. Do not include markdown code block formatting (e.g. no ```json). Return ONLY the raw JSON object.
"""

def build_investigation_prompt(
    incident: IncidentCreate, 
    memories: List[HistoricalMemory], 
    hindsight_enabled: bool = True,
    resolution_history: Optional[List[Any]] = None
) -> str:
    current_facts = {
        "title": incident.title,
        "service": incident.service,
        "severity": incident.severity,
        "environment": incident.environment,
        "symptoms": incident.symptoms,
        "logs_and_traces": incident.logs or "None provided",
        "tags": incident.tags,
        "recent_deployment": incident.recent_deployment or "None reported"
    }

    temporal_section = ""

    if not hindsight_enabled:
        memory_section = """[HISTORICAL MEMORY FROM HINDSIGHT - DISABLED]
Hindsight memory was explicitly turned OFF for this analysis.
Reasoning input contains ONLY the current live incident information above.
Do NOT assume or invent any past postmortems or historical fixes.
In 'historical_evidence', return exactly: ["Analysis based only on the current incident. Hindsight memory was disabled."].
In 'detected_pattern', reason from first principles based solely on current telemetry.
"""
        instructions = """INSTRUCTIONS FOR GROQ REASONING (HINDSIGHT MEMORY: OFF):
1. Reason strictly from the current incident facts, logs, and symptoms.
2. Formulate a working hypothesis based purely on live observability signals.
3. Recommend safe diagnostic investigation steps to isolate the issue.
4. Set 'temporal_reasoning' with 'has_sufficient_history': false and note that memory was OFF.
"""
    elif not memories:
        memory_section = """[HISTORICAL MEMORY FROM HINDSIGHT - NO MATCH FOUND]
Hindsight was ENABLED, but no sufficiently relevant historical incidents were found in organizational memory.
In 'historical_evidence', return: ["Hindsight enabled, but no sufficiently relevant historical incidents were found."].
"""
        instructions = """INSTRUCTIONS FOR GROQ REASONING (HINDSIGHT MEMORY: NO MATCH):
1. Reason from current incident facts as a novel, unprecedented failure.
2. Explicitly note that organizational memory contains no matching failure patterns.
3. Set 'temporal_reasoning' with 'has_sufficient_history': false and note that no precedents matched.
"""
    else:
        formatted_memories = []
        for idx, mem in enumerate(memories, 1):
            mem_dict = {
                "memory_index": idx,
                "memory_id": mem.id or mem.incident_id,
                "incident_id": mem.incident_id,
                "service": mem.service,
                "severity": mem.severity,
                "date": mem.date_display or mem.date,
                "symptoms": mem.symptoms,
                "root_cause": mem.root_cause,
                "successful_fixes": mem.successful_fixes or ([mem.resolution] if mem.resolution else []),
                "failed_fixes_to_avoid": mem.failed_fixes or [],
                "verified_resolution": mem.resolution,
                "outcome": mem.outcome,
                "relevance_score": mem.score
            }
            formatted_memories.append(mem_dict)

        memory_section = f"""[HISTORICAL MEMORY FROM HINDSIGHT - RETRIEVED PRECEDENTS]
{json.dumps(formatted_memories, indent=2)}
"""

        # Format Resolution History if provided
        if resolution_history and len(resolution_history) > 0:
            hist_serialized = []
            for h in resolution_history:
                h_dict = h.dict() if hasattr(h, "dict") else dict(h)
                hist_serialized.append(h_dict)
            temporal_section = f"""
=======================================================
CHRONOLOGICAL RESOLUTION HISTORY & TEMPORAL PROGRESSION:
=======================================================
{json.dumps(hist_serialized, indent=2)}
"""

        instructions = """INSTRUCTIONS FOR GROQ REASONING & TEMPORAL ANALYSIS (HINDSIGHT MEMORY: ON):
1. Use historical memory as concrete organizational evidence.
2. CRITICAL TEMPORAL REASONING:
   - Analyze how solutions evolved over time across the chronological history.
   - Compare what solution worked in older incidents vs what worked in more recent incidents.
   - Check what solutions failed and whether a previously successful solution later failed.
   - Consider system/deployment changes that explain why earlier solutions were no longer sufficient.
   - NEVER say "The old solution is outdated."
   - Keep older successful solutions as possible alternatives — NEVER assume the newest solution is automatically better.
3. In 'temporal_reasoning':
   - 'has_sufficient_history': true (if 2+ historical incidents exist),
   - 'temporal_insight': Short explanation generated from ACTUAL historical evidence explaining how solution effectiveness changed over time.
   - 'recommended_approach': Solution with strongest recent evidence.
   - 'alternative_historical_approach': Another historically successful option supported by memory.
   - 'why': Brief evidence-based explanation.
"""

    prompt = f"""Analyze the following production incident.

=======================================================
CURRENT INCIDENT:
=======================================================
{json.dumps(current_facts, indent=2)}

=======================================================
HISTORICAL MEMORY FROM HINDSIGHT:
=======================================================
{memory_section}
{temporal_section}
=======================================================
OPERATIONAL INSTRUCTIONS:
=======================================================
{instructions}

=======================================================
[REQUIRED OUTPUT JSON SCHEMA]
=======================================================
Return a single JSON object with these exact keys:
{{
  "incident_summary": "Concise 1-2 sentence executive summary of current incident facts.",
  "current_incident_facts": [
    "Fact 1: Affected service is ...",
    "Fact 2: Symptoms observed: ..."
  ],
  "historical_evidence": [
    "Evidence 1: Verified past incident [ID] experienced ... which was caused by ...",
    "Evidence 2: ..."
  ],
  "temporal_reasoning": {{
    "has_sufficient_history": true,
    "temporal_insight": "A short explanation generated from the ACTUAL historical evidence explaining how the effectiveness of solutions evolved over time. NEVER say 'the old solution is outdated'. Keep older successful solutions as possible alternatives.",
    "recommended_approach": "Recommended approach taking into account recency, repeated success, and recent failures.",
    "alternative_historical_approach": "Another historically successful option, if supported by memory.",
    "why": "Brief evidence-based explanation comparing solutions over time."
  }},
  "detected_pattern": "A clear description of the detected pattern connecting past incidents to current symptoms. If memory was OFF or no matches found, describe the pattern from first principles.",
  "suspected_root_cause_hypothesis": "Possible root cause hypothesis for engineering verification.",
  "investigation_plan": [
    "1. Check resource utilization.",
    "2. Review recent deployments.",
    "3. Inspect affected application pods."
  ],
  "recommended_next_steps": [
    "Actionable safe diagnostic command 1",
    "Actionable safe diagnostic command 2"
  ],
  "historical_relevance_notes": {{
    "1": "Explanation of why historical incident #1 is relevant."
  }},
  "safety_disclaimer": "AI Incident Response Agent provides diagnostic decision-support only. It does NOT execute automated production mutations or repairs. All diagnostic actions must be reviewed and performed by authorized engineering personnel."
}}
"""
    return prompt
