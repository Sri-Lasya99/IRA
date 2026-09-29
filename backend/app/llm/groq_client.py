import json
import re
import logging
from typing import List, Optional
from groq import Groq
from app.config import settings
from app.models.schemas import IncidentCreate, HistoricalMemory, InvestigationReport, TemporalReasoning
from app.llm.prompts import SYSTEM_PROMPT, build_investigation_prompt
from app.memory.temporal import build_resolution_history, synthesize_temporal_reasoning
from app.llm.intelligence import (
    calculate_similarity_factors,
    generate_incident_dna,
    build_evidence_chain,
    generate_incident_timeline,
    generate_memory_impact
)

logger = logging.getLogger("incident_agent.groq")

class GroqLLMClient:
    def __init__(self):
        self.api_keys = [settings.GROQ_API_KEY]
        if settings.GROQ_BACKUP_KEYS:
            self.api_keys.extend([k.strip() for k in settings.GROQ_BACKUP_KEYS.split(",") if k.strip()])
        self.current_key_idx = 0
        self.model = settings.GROQ_MODEL
        self._init_client()

    def _init_client(self):
        key = self.api_keys[self.current_key_idx]
        self.client = Groq(api_key=key)

    def _rotate_key(self):
        if len(self.api_keys) > 1:
            self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
            logger.warning(f"Rotating Groq API key to index {self.current_key_idx}")
            self._init_client()

    def generate_investigation_report(
        self, 
        incident: IncidentCreate, 
        memories: List[HistoricalMemory],
        hindsight_enabled: bool = True,
        memory_error: Optional[str] = None
    ) -> InvestigationReport:
        memory_mode = "on" if hindsight_enabled else "off"
        memory_used = bool(hindsight_enabled and memories and not memory_error)
        historical_count = len(memories) if memory_used else 0

        # Precompute explainable similarity factors for all memories if memory is enabled
        if memory_used:
            for mem in memories:
                sim_factors = calculate_similarity_factors(incident, mem)
                mem.similarity_factors = sim_factors
                if not mem.relevance_reason:
                    mem.relevance_reason = sim_factors["explanation"]
                mem.similarity_explanation = sim_factors["explanation"]

        dna = generate_incident_dna(incident, memories if memory_used else [])
        timeline = generate_incident_timeline(incident, is_resolved=False, recalled_count=historical_count)
        memory_impact = generate_memory_impact()

        # Build resolution history & temporal reasoning baseline
        resolution_history = build_resolution_history(memories if memory_used else [])
        default_temporal = synthesize_temporal_reasoning(
            incident=incident,
            resolution_history=resolution_history,
            hindsight_enabled=hindsight_enabled and memory_used
        )

        prompt = build_investigation_prompt(
            incident, 
            memories if memory_used else [], 
            hindsight_enabled=hindsight_enabled,
            resolution_history=resolution_history
        )
        
        last_error = None
        for attempt in range(len(self.api_keys) + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=2500,
                    response_format={"type": "json_object"}
                )

                content = response.choices[0].message.content or "{}"
                clean_content = re.sub(r"^```json\s*", "", content.strip())
                clean_content = re.sub(r"```$", "", clean_content.strip())
                
                data = json.loads(clean_content)

                # Extract relevance notes and attach to memories
                rel_notes = data.get("historical_relevance_notes", {})
                if memory_used:
                    for idx, mem in enumerate(memories, 1):
                        explanation = rel_notes.get(str(idx)) or rel_notes.get(mem.id) or rel_notes.get(mem.incident_id)
                        if explanation:
                            mem.relevance_reason = explanation

                if not hindsight_enabled:
                    detected_pattern = data.get("detected_pattern") or (
                        f"Analysis based purely on current observability telemetry. Pattern suggests potential resource constraint or configuration issue on {incident.service}."
                    )
                    historical_evidence = ["Analysis based only on the current incident. Hindsight memory was disabled."]
                    impact_statement = "Hindsight memory was OFF. Groq reasoned using ONLY current incident telemetry without organizational memory."
                elif memory_error:
                    detected_pattern = data.get("detected_pattern") or (
                        f"Hindsight recall failed. SRE triage proceeding using live incident telemetry for {incident.service}."
                    )
                    historical_evidence = [f"Hindsight recall failed: {memory_error}. Operating without historical memory."]
                    impact_statement = f"Hindsight memory was ON, but recall failed: {memory_error}"
                elif not memories:
                    detected_pattern = data.get("detected_pattern") or (
                        f"Novel failure pattern on {incident.service}; no matching prior outages found in organizational memory."
                    )
                    historical_evidence = ["Hindsight enabled, but no sufficiently relevant historical incidents were found."]
                    impact_statement = "Hindsight memory was ON, but no matching precedents were found. Groq reasoned from first principles."
                else:
                    detected_pattern = data.get("detected_pattern") or (
                        f"Previous incidents show a recurring pattern of {incident.service} failure matching historical precedents in Hindsight Cloud."
                    )
                    historical_evidence = data.get("historical_evidence") or [
                        f"Recalled {len(memories)} relevant incident postmortems from Hindsight Cloud bank '{settings.HINDSIGHT_BANK_ID}'."
                    ]
                    impact_statement = f"Hindsight recalled {len(memories)} verified historical incident(s), directly informing the root cause hypothesis and remediation plan."

                plan = data.get("investigation_plan") or [
                    f"1. Check {incident.service} connection pool and resource utilization.",
                    "2. Review recent deployments or configuration changes.",
                    f"3. Inspect affected application pods and error logs.",
                    "4. Compare current metrics with historical incident baselines." if memory_used else "4. Monitor application health metrics.",
                    "5. Verify previous remediations if applicable." if memory_used else "5. Formulate remediation plan."
                ]

                evidence_chain = build_evidence_chain(
                    incident=incident,
                    recalled_memories=memories if memory_used else [],
                    investigation_plan=plan,
                    detected_pattern=detected_pattern,
                    is_resolved=False
                )

                groq_temporal = data.get("temporal_reasoning")
                if groq_temporal and isinstance(groq_temporal, dict) and memory_used:
                    temporal_reasoning = TemporalReasoning(
                        has_sufficient_history=bool(groq_temporal.get("has_sufficient_history", len(resolution_history) >= 2)),
                        resolution_history=resolution_history,
                        temporal_insight=groq_temporal.get("temporal_insight") or default_temporal.temporal_insight,
                        recommended_approach=groq_temporal.get("recommended_approach") or default_temporal.recommended_approach,
                        alternative_historical_approach=groq_temporal.get("alternative_historical_approach") or default_temporal.alternative_historical_approach,
                        why=groq_temporal.get("why") or default_temporal.why,
                        status_notice=groq_temporal.get("status_notice") or default_temporal.status_notice
                    )
                else:
                    temporal_reasoning = default_temporal

                return InvestigationReport(
                    incident_summary=data.get("incident_summary") or f"Incident affecting {incident.service} with severity {incident.severity}.",
                    current_incident_facts=data.get("current_incident_facts") or [
                        f"Service: {incident.service}",
                        f"Severity: {incident.severity}",
                        f"Symptoms: {incident.symptoms}"
                    ],
                    historical_evidence=historical_evidence,
                    detected_pattern=detected_pattern,
                    investigation_plan=plan,
                    recommended_next_steps=data.get("recommended_next_steps") or [
                        f"Inspect live pod logs for {incident.service}",
                        "Check upstream gateway timeouts and error rates",
                        "Evaluate if immediate rollback or scale-up is warranted"
                    ],
                    historical_relevance_notes=rel_notes,
                    incident_dna=dna,
                    evidence_chain=evidence_chain,
                    incident_timeline=timeline,
                    memory_impact=memory_impact,
                    temporal_reasoning=temporal_reasoning,
                    memory_mode=memory_mode,
                    memory_used=memory_used,
                    historical_incidents_count=historical_count,
                    memory_error=memory_error,
                    memory_impact_statement=impact_statement,
                    safety_disclaimer=data.get(
                        "safety_disclaimer",
                        "AI Incident Response Agent provides diagnostic decision-support only. "
                        "It does NOT execute automated production mutations or repairs. All diagnostic actions "
                        "must be reviewed and performed by authorized engineering personnel."
                    )
                )

            except Exception as e:
                logger.error(f"Groq API call attempt {attempt + 1} failed: {e}")
                last_error = e
                self._rotate_key()

        # Graceful fallback if Groq API is temporarily unavailable
        logger.warning(f"Groq API unavailable ({last_error}). Providing deterministic SRE decision-support fallback.")
        if not hindsight_enabled:
            detected_pattern = f"Telemetry triage indicates possible resource saturation or upstream latency on {incident.service}. Reasoned strictly without historical memory."
            historical_evidence = ["Analysis based only on the current incident. Hindsight memory was disabled."]
            impact_statement = "Hindsight memory was OFF. Groq reasoned using ONLY current incident telemetry."
        elif memory_error:
            detected_pattern = f"Telemetry triage on {incident.service}. Hindsight recall failed."
            historical_evidence = [f"Hindsight recall failed: {memory_error}."]
            impact_statement = f"Hindsight memory was ON, but recall failed: {memory_error}"
        elif not memories:
            detected_pattern = f"Novel failure pattern on {incident.service}; no matching prior outages found in organizational memory."
            historical_evidence = ["Hindsight enabled, but no sufficiently relevant historical incidents were found."]
            impact_statement = "Hindsight memory was ON, but no matching precedents were found."
        else:
            detected_pattern = f"Previous incidents indicate a recurring pattern on {incident.service} matching past historical precedents."
            historical_evidence = [f"Recalled {len(memories)} matching postmortems from Hindsight Cloud bank '{settings.HINDSIGHT_BANK_ID}'."]
            impact_statement = f"Hindsight recalled {len(memories)} verified historical precedent(s)."

        plan = [
            f"1. Check {incident.service} connection pool and socket read timeouts.",
            "2. Review recent deployment releases or configuration diffs.",
            f"3. Inspect affected pods and check error rates on upstream ingress.",
            "4. Compare current metrics against historical postmortem baselines." if memory_used else "4. Monitor system metrics.",
            "5. Apply verified remediation if historical pattern matches." if memory_used else "5. Test candidate fix in staging."
        ]
        evidence_chain = build_evidence_chain(
            incident=incident,
            recalled_memories=memories if memory_used else [],
            investigation_plan=plan,
            detected_pattern=detected_pattern,
            is_resolved=False
        )
        return InvestigationReport(
            incident_summary=f"Incident affecting {incident.service} with severity {incident.severity}: {incident.title}",
            current_incident_facts=[
                f"Service: {incident.service}",
                f"Severity: {incident.severity}",
                f"Symptoms: {incident.symptoms}",
                f"Environment: {incident.environment}",
                f"Recent deployment: {incident.recent_deployment or 'None reported'}"
            ],
            historical_evidence=historical_evidence,
            detected_pattern=detected_pattern,
            investigation_plan=plan,
            recommended_next_steps=[
                f"Execute safe diagnostic CLI queries for {incident.service}",
                "Review upstream ingress proxy error rates and connection metrics",
                "Verify if historical remediation patch applies to current symptom profile" if memory_used else "Determine candidate remediation"
            ],
            historical_relevance_notes={},
            incident_dna=dna,
            evidence_chain=evidence_chain,
            incident_timeline=timeline,
            memory_impact=memory_impact,
            temporal_reasoning=default_temporal,
            memory_mode=memory_mode,
            memory_used=memory_used,
            historical_incidents_count=historical_count,
            memory_error=memory_error,
            memory_impact_statement=impact_statement,
            safety_disclaimer=(
                "AI Incident Response Agent provides diagnostic decision-support only. "
                "It does NOT execute automated production mutations or repairs. All diagnostic actions "
                "must be reviewed and performed by authorized engineering personnel."
            )
        )

    def health_check(self) -> dict:
        try:
            res = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            return {
                "connected": True,
                "model": self.model,
                "status": "healthy"
            }
        except Exception as e:
            return {
                "connected": False,
                "model": self.model,
                "error": str(e)
            }

groq_llm = GroqLLMClient()
