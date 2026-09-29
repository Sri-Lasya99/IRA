import re
import logging
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.config import settings
from app.models.schemas import HistoricalMemory

logger = logging.getLogger("incident_agent.memory")

def parse_memory_fields(content: str, item_id: str = "", default_timestamp: str = None) -> Dict[str, Optional[str]]:
    """
    Parse structured incident fields from Hindsight memory content.
    Extracts: incident_id, date, service, severity, symptoms, root_cause, resolution, outcome.
    """
    fields = {
        "incident_id": None,
        "date": default_timestamp,
        "date_display": None,
        "service": None,
        "severity": None,
        "environment": None,
        "symptoms": None,
        "root_cause": None,
        "resolution": None,
        "outcome": None,
    }

    if not content:
        return fields

    # 1. Incident ID
    m_id = re.search(r"HISTORICAL INCIDENT REPORT\s*\[ID:\s*([^\]]+)\]", content, re.IGNORECASE)
    if not m_id:
        m_id = re.search(r"Incident ID:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_id:
        fields["incident_id"] = m_id.group(1).strip()
    else:
        fields["incident_id"] = item_id or "INC-HIST-UNKNOWN"

    # 2. Date
    m_date = re.search(r"Date:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_date:
        fields["date"] = m_date.group(1).strip()
        
    m_dd = re.search(r"Date Display:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_dd:
        fields["date_display"] = m_dd.group(1).strip()
    elif fields["date"]:
        # Generate friendly display if ISO date e.g. 2026-01-14 -> Jan 2026
        try:
            iso_str = fields["date"].replace("Z", "")
            dt = datetime.fromisoformat(iso_str)
            fields["date_display"] = dt.strftime("%b %Y")
        except Exception:
            fields["date_display"] = fields["date"][:10]

    # 2.5 Title
    m_title = re.search(r"Title:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_title:
        fields["title"] = m_title.group(1).strip()

    # 3. Service
    m_srv = re.search(r"(?:Affected Service|Service):\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_srv:
        fields["service"] = m_srv.group(1).strip()

    # 4. Severity
    m_sev = re.search(r"Severity:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_sev:
        fields["severity"] = m_sev.group(1).strip()

    # 5. Environment
    m_env = re.search(r"Environment:\s*([^\n\r]+)", content, re.IGNORECASE)
    if m_env:
        fields["environment"] = m_env.group(1).strip()

    # 6. Symptoms
    m_sym = re.search(
        r"(?:Symptoms & Error Signatures|Symptoms):\s*([\s\S]*?)(?=(?:Diagnostic Information|Recent Deployment|VERIFIED ROOT CAUSE|Root Cause|$))",
        content,
        re.IGNORECASE
    )
    if m_sym and m_sym.group(1).strip():
        fields["symptoms"] = m_sym.group(1).strip()
    else:
        # Fallback to first lines if text-based memory
        lines = [line.strip() for line in content.split("\n") if line.strip() and not line.startswith("HISTORICAL")]
        fields["symptoms"] = lines[0] if lines else "Symptoms documented in memory record."

    # 7. Root Cause
    m_rc = re.search(
        r"(?:VERIFIED ROOT CAUSE|Root Cause):\s*([\s\S]*?)(?=(?:RESOLVED MITIGATION|Resolution Duration|Resolution|OUTCOME|Outcome|$))",
        content,
        re.IGNORECASE
    )
    if m_rc and m_rc.group(1).strip():
        fields["root_cause"] = m_rc.group(1).strip()

    # 8. Resolution
    m_res = re.search(
        r"(?:RESOLVED MITIGATION & REMEDIATION APPLIED|Resolution):\s*([\s\S]*?)(?=(?:OUTCOME|Outcome|Resolution Duration|Preventive Measures|$))",
        content,
        re.IGNORECASE
    )
    if m_res and m_res.group(1).strip():
        fields["resolution"] = m_res.group(1).strip()

    # 9. Outcome
    m_out = re.search(
        r"(?:OUTCOME|Outcome):\s*([\s\S]*?)(?=(?:Resolution Duration|Preventive Measures|Tags|$))",
        content,
        re.IGNORECASE
    )
    if m_out and m_out.group(1).strip():
        fields["outcome"] = m_out.group(1).strip()
    else:
        if fields["resolution"]:
            fields["outcome"] = "Mitigation applied; system returned to operational baseline."

    # 10. Successful Fixes & Failed Fixes
    successful_fixes = []
    failed_fixes = []

    m_succ = re.search(
        r"(?:SUCCESSFUL FIXES|Successful Fixes):\s*([\s\S]*?)(?=(?:FAILED FIXES|RESOLVED MITIGATION|Resolution|OUTCOME|$))",
        content,
        re.IGNORECASE
    )
    if m_succ and m_succ.group(1).strip():
        for line in m_succ.group(1).split("\n"):
            line_clean = line.strip().lstrip("✓").lstrip("-").lstrip("*").strip()
            if line_clean:
                successful_fixes.append(line_clean)

    m_fail = re.search(
        r"(?:FAILED FIXES TO AVOID|FAILED FIXES|Failed Fixes):\s*([\s\S]*?)(?=(?:RESOLVED MITIGATION|Resolution|OUTCOME|$))",
        content,
        re.IGNORECASE
    )
    if m_fail and m_fail.group(1).strip():
        for line in m_fail.group(1).split("\n"):
            line_clean = line.strip().lstrip("✕").lstrip("x").lstrip("-").lstrip("*").strip()
            if line_clean:
                failed_fixes.append(line_clean)

    fields["successful_fixes"] = successful_fixes if successful_fixes else None
    fields["failed_fixes"] = failed_fixes if failed_fixes else None

    return fields


class HindsightMemoryClient:
    """
    Direct interface to Hindsight Cloud persistent memory layer.
    Target Bank: unicase-incident-memory
    """
    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip("/")
        self.api_key = settings.HINDSIGHT_API_KEY
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "incident-response-agent/1.0"
        }

    async def recall(self, query: str, tags: Optional[List[str]] = None, budget: str = "mid") -> List[HistoricalMemory]:
        """
        Recall relevant historical incident memories from Hindsight Cloud.
        Queries target bank: unicase-incident-memory
        """
        endpoint = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/recall"
        payload: Dict[str, Any] = {
            "query": query,
            "budget": budget,
            "max_tokens": 4096,
            "types": ["world", "experience", "observation"]
        }
        if tags:
            clean_tags = [t.lower().strip() for t in tags if t.strip()]
            if clean_tags:
                payload["tags"] = clean_tags
                payload["tags_match"] = "any"

        logger.info(f"Executing Hindsight Cloud RECALL on bank '{self.bank_id}' with query: '{query}'")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(endpoint, json=payload, headers=self.headers)
                
            if response.status_code != 200:
                logger.error(f"Hindsight Cloud recall failed ({response.status_code}): {response.text}")
                raise RuntimeError(f"Hindsight Cloud recall failed ({response.status_code}): {response.text}")

            data = response.json()
            raw_results = data.get("results", []) or []
            
            memories: List[HistoricalMemory] = []
            for item in raw_results:
                content = item.get("text") or item.get("content") or ""
                if not content and "fact" in item:
                    content = str(item.get("fact"))
                
                if content:
                    item_id = str(item.get("id") or item.get("memory_id") or "")
                    ts = item.get("timestamp") or item.get("occurred_at") or ""
                    
                    # Extract structured postmortem fields from the memory
                    parsed = parse_memory_fields(content, item_id, ts)

                    memories.append(HistoricalMemory(
                        id=item_id,
                        content=content,
                        fact_type=item.get("type", "experience"),
                        score=float(item.get("score") or item.get("final_score") or 0.0),
                        context=item.get("context"),
                        timestamp=ts,
                        metadata={
                            "tags": item.get("tags", []),
                            "entities": item.get("entities", [])
                        },
                        incident_id=parsed["incident_id"],
                        title=parsed.get("title"),
                        date=parsed["date"] or ts,
                        date_display=parsed.get("date_display"),
                        service=parsed["service"],
                        severity=parsed["severity"],
                        environment=parsed["environment"],
                        symptoms=parsed["symptoms"],
                        root_cause=parsed["root_cause"],
                        resolution=parsed["resolution"],
                        outcome=parsed["outcome"],
                        successful_fixes=parsed["successful_fixes"],
                        failed_fixes=parsed["failed_fixes"],
                        relevance_reason=None
                    ))

            logger.info(f"Hindsight Cloud returned {len(memories)} historical memories.")
            return memories

        except httpx.RequestError as e:
            logger.exception(f"Network error connecting to Hindsight Cloud: {e}")
            raise RuntimeError(f"Could not connect to Hindsight Cloud: {e}")

    async def retain(
        self,
        incident_id: str,
        title: str,
        service: str,
        severity: str,
        environment: str,
        symptoms: str,
        diagnostic_info: str,
        recent_deployment: str,
        root_cause: str,
        resolution: str,
        outcome: str,
        resolved_by: str = "engineer",
        duration_minutes: int = 30,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Retain resolved incident experience into Hindsight Cloud bank 'unicase-incident-memory'.
        Stores:
        - incident ID
        - timestamp
        - service
        - severity
        - environment
        - symptoms
        - diagnostic information
        - recent deployment/change
        - root cause
        - resolution
        - outcome
        """
        endpoint = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories"
        now_iso = datetime.utcnow().isoformat() + "Z"

        clean_tags = list(set([t.lower().strip() for t in (tags or []) if t.strip()]))
        clean_tags.extend([service.lower(), "incident-postmortem", severity.lower(), environment.lower()])
        clean_tags = list(set(clean_tags))

        # Format comprehensive memory document strictly capturing all required fields
        memory_content = (
            f"HISTORICAL INCIDENT REPORT [ID: {incident_id}]\n"
            f"Date: {now_iso}\n"
            f"Affected Service: {service}\n"
            f"Severity: {severity}\n"
            f"Environment: {environment}\n"
            f"Title: {title}\n\n"
            f"Symptoms & Error Signatures:\n{symptoms}\n\n"
            f"Diagnostic Information:\n{diagnostic_info or 'None documented'}\n\n"
            f"Recent Deployment/Change:\n{recent_deployment or 'None documented'}\n\n"
            f"VERIFIED ROOT CAUSE:\n{root_cause}\n\n"
            f"RESOLVED MITIGATION & REMEDIATION APPLIED:\n{resolution}\n\n"
            f"OUTCOME:\n{outcome}\n\n"
            f"Resolution Duration: {duration_minutes} minutes | Resolved By: {resolved_by}"
        )

        payload = {
            "async": False,
            "items": [
                {
                    "content": memory_content,
                    "context": f"incident:{service}",
                    "document_id": incident_id,
                    "tags": clean_tags,
                    "timestamp": now_iso
                }
            ]
        }

        logger.info(f"Executing Hindsight Cloud RETAIN for incident {incident_id} into bank '{self.bank_id}'")

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(endpoint, json=payload, headers=self.headers)

            if response.status_code in [200, 201, 202]:
                data = response.json()
                logger.info(f"Successfully retained incident {incident_id} in Hindsight Cloud.")
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "response": data
                }
            else:
                logger.error(f"Hindsight retain returned error {response.status_code}: {response.text}")
                raise RuntimeError(f"Hindsight Cloud retain failed ({response.status_code}): {response.text}")
        except httpx.RequestError as e:
            logger.exception(f"Network error retaining to Hindsight Cloud: {e}")
            raise RuntimeError(f"Could not connect to Hindsight Cloud for retain: {e}")

    async def list_memories(self, limit: int = 50) -> Dict[str, Any]:
        """
        List existing memories in Hindsight Cloud bank 'unicase-incident-memory'.
        """
        endpoint = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/list?limit={limit}"
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(endpoint, headers=self.headers)
            if response.status_code == 200:
                return response.json()
            raise RuntimeError(f"Hindsight list failed ({response.status_code}): {response.text}")
        except httpx.RequestError as e:
            raise RuntimeError(f"Could not connect to Hindsight Cloud: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """
        Verify Hindsight Cloud endpoint and memory bank connectivity.
        Returns live count of actual memories.
        """
        endpoint = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/list?limit=1"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(endpoint, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return {
                    "connected": True,
                    "bank_id": self.bank_id,
                    "base_url": self.base_url,
                    "total_memories": data.get("total", 0),
                    "status": "healthy"
                }
            else:
                return {
                    "connected": False,
                    "bank_id": self.bank_id,
                    "status_code": response.status_code,
                    "error": response.text
                }
        except Exception as e:
            return {
                "connected": False,
                "bank_id": self.bank_id,
                "error": str(e)
            }

hindsight_client = HindsightMemoryClient()
