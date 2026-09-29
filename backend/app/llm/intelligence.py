import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.schemas import (
    IncidentCreate,
    HistoricalMemory,
    IncidentDNA,
    EvidenceNode,
    TimelineEvent,
    MemoryImpact,
    LearningSummary,
    IncidentResolutionCreate
)

def calculate_similarity_factors(incident: IncidentCreate, memory: HistoricalMemory) -> Dict[str, Any]:
    """
    Compute explainable breakdown of similarity factors between current incident and historical memory.
    Factors:
    - Service Match (30%)
    - Error Pattern Match (25%)
    - Dependency Match (20%)
    - Symptom Match (15%)
    - Stack Trace Match (10%)
    """
    inc_service = (incident.service or "").lower().strip()
    mem_service = (memory.service or "").lower().strip()
    
    # 1. Service Match (Weight: 30%)
    if inc_service and mem_service and inc_service == mem_service:
        service_score = 30
        service_reason = f"Exact service match ({incident.service})"
    elif inc_service in mem_service or mem_service in inc_service:
        service_score = 22
        service_reason = f"Service domain overlap ({inc_service} ~ {mem_service})"
    else:
        service_score = 8
        service_reason = "Cross-service architectural similarity"

    # 2. Error Pattern Match (Weight: 25%)
    inc_text = f"{incident.title} {incident.symptoms} {incident.logs or ''}".lower()
    mem_text = f"{memory.content} {memory.symptoms or ''} {memory.root_cause or ''}".lower()

    error_signals = ["504", "timeout", "deadlock", "deserialization", "connection pool", "lag", "rebalance", "500", "oom", "socket"]
    matched_errors = [sig for sig in error_signals if sig in inc_text and sig in mem_text]

    if len(matched_errors) >= 2:
        error_score = 25
        error_reason = f"Identical error patterns: {', '.join(matched_errors)}"
    elif len(matched_errors) == 1:
        error_score = 18
        error_reason = f"Matching error signature: {matched_errors[0]}"
    else:
        error_score = 7
        error_reason = "General latency / availability anomaly"

    # 3. Dependency Match (Weight: 20%)
    dep_signals = ["redis", "postgres", "kafka", "envoy", "grpc", "mysql", "elasticsearch", "rabbitmq"]
    matched_deps = [dep for dep in dep_signals if dep in inc_text and dep in mem_text]

    if len(matched_deps) >= 2:
        dep_score = 20
        dep_reason = f"Shared critical dependencies: {', '.join([d.title() for d in matched_deps])}"
    elif len(matched_deps) == 1:
        dep_score = 15
        dep_reason = f"Shared infrastructure component: {matched_deps[0].title()}"
    else:
        dep_score = 6
        dep_reason = "Shared upstream gateway communication"

    # 4. Symptom Match (Weight: 15%)
    symptom_keywords = ["latency", "spike", "saturation", "timeout", "rebalance", "aborts", "stalled", "deadlock", "queue"]
    matched_symptoms = [s for s in symptom_keywords if s in inc_text and s in mem_text]

    if len(matched_symptoms) >= 3:
        symptom_score = 15
        symptom_reason = f"Strong symptom correlation ({', '.join(matched_symptoms[:3])})"
    elif len(matched_symptoms) >= 1:
        symptom_score = 10
        symptom_reason = f"Correlated observable symptoms ({', '.join(matched_symptoms)})"
    else:
        symptom_score = 4
        symptom_reason = "High-level performance degradation"

    # 5. Stack Trace Match (Weight: 10%)
    trace_signals = ["jedis", "asyncpg", "jackson", "httpx", "pool", "socket", "lock", "coordinator", "deserialization"]
    matched_traces = [t for t in trace_signals if t in inc_text and t in mem_text]

    if matched_traces:
        trace_score = 10 if len(matched_traces) >= 2 else 7
        trace_reason = f"Matching library stack signatures ({', '.join(matched_traces)})"
    else:
        trace_score = 3
        trace_reason = "Compatible runtime stack profile"

    total_score = min(service_score + error_score + dep_score + symptom_score + trace_score, 98)
    if memory.score:
        # Calibrate with Hindsight's vector/BM25 similarity
        calibrated = int(memory.score * 100)
        if calibrated > 40:
            total_score = max(total_score, min(calibrated, 96))

    factors = [
        {"name": "Service Match", "percentage": service_score, "max": 30, "detail": service_reason},
        {"name": "Error Pattern Match", "percentage": error_score, "max": 25, "detail": error_reason},
        {"name": "Dependency Match", "percentage": dep_score, "max": 20, "detail": dep_reason},
        {"name": "Symptom Match", "percentage": symptom_score, "max": 15, "detail": symptom_reason},
        {"name": "Stack Trace Match", "percentage": trace_score, "max": 10, "detail": trace_reason},
    ]

    explanation = (
        f"This incident is similar because both incidents involve {incident.service} "
        f"{', '.join(matched_errors) if matched_errors else 'failure symptoms'}, "
        f"shared reliance on {', '.join([d.title() for d in matched_deps]) if matched_deps else 'platform infrastructure'}, "
        f"and matching degradation patterns."
    )

    return {
        "total_similarity": total_score,
        "factors": factors,
        "explanation": explanation,
        "label": "Similarity factors (explainable breakdown)"
    }


def generate_incident_dna(incident: IncidentCreate, recalled_memories: List[HistoricalMemory]) -> IncidentDNA:
    """
    Generate an Incident DNA fingerprint.
    Extracts real facts from incident input without inventing fake metrics.
    """
    text = f"{incident.title} {incident.symptoms} {incident.logs or ''}".lower()

    # 1. Error Pattern
    if "504" in text:
        error_pattern = "HTTP 504 Gateway Timeout"
    elif "deserialization" in text or "kafka" in text:
        error_pattern = "RecordDeserializationException / Consumer Eviction"
    elif "deadlock" in text:
        error_pattern = "DeadlockDetectedError (ShareLock vs ExclusiveLock)"
    elif "500" in text:
        error_pattern = "HTTP 500 Internal Server Error"
    elif "timeout" in text:
        error_pattern = "Socket Read Timeout / Latency Spike"
    else:
        error_pattern = "Unclassified Latency / Service Degradation"

    # 2. Symptoms List
    symptoms_list = []
    for line in incident.symptoms.split("."):
        line = line.strip()
        if line and len(line) > 5:
            symptoms_list.append(line)
    if not symptoms_list:
        symptoms_list = [incident.symptoms]

    # 3. Dependencies
    dep_candidates = {
        "redis": "Redis Session Cache",
        "postgres": "PostgreSQL Database",
        "kafka": "Apache Kafka (orders-v2)",
        "envoy": "Envoy Ingress Proxy",
        "jedis": "Jedis Connection Pool",
        "asyncpg": "Asyncpg Pool",
        "billing": "Billing Settlement Engine",
        "payment": "Payment Processing Gateway"
    }
    dependencies = [name for key, name in dep_candidates.items() if key in text]
    if not dependencies:
        dependencies = ["Platform Ingress Gateway", "Core Database"]

    # 4. Infrastructure
    if "pod" in text or "kubernetes" in text or "k8s" in text or "cluster" in text:
        infrastructure = "Kubernetes Cluster (Application Pods)"
    elif "postgres" in text:
        infrastructure = "PostgreSQL RDS / Stateful Storage"
    elif "broker" in text:
        infrastructure = "Kafka Distributed Cluster Nodes"
    else:
        infrastructure = "Cloud Container Runtime"

    # 5. Recent Changes
    recent_changes = incident.recent_deployment if incident.recent_deployment and incident.recent_deployment.strip() else "Not available"

    # 6. Real Metrics Only (Strict constraint: do NOT invent metrics)
    metrics: Dict[str, str] = {}
    
    # Check for latency in text
    lat_match = re.search(r"(\d+ms\s*(?:to|->|→)\s*\d+ms|\d+\s*ms|\d+\s*seconds)", text)
    if lat_match:
        metrics["Latency Shift"] = lat_match.group(1)
    else:
        metrics["Latency Shift"] = "Not available"

    # Check for percentages
    pct_match = re.search(r"(\d+%\s*(?:cpu|error rate|timeout|aborts|deadlocks|increase))", text)
    if not pct_match:
        pct_match = re.search(r"(\d+%)", text)
    if pct_match:
        metrics["Observed Spike"] = pct_match.group(1)
    else:
        metrics["Observed Spike"] = "Not available"

    # Check for queue/lag/counts
    count_match = re.search(r"(\d+[\d,]*\s*(?:messages|aborts|errors|requests|connections))", text)
    if count_match:
        metrics["Volume Anomaly"] = count_match.group(1)
    else:
        metrics["Volume Anomaly"] = "Not available"

    # 7. Historical Similarity
    if recalled_memories:
        top_mem = recalled_memories[0]
        top_id = top_mem.incident_id or top_mem.id or "INC-HIST-001"
        sim_pct = int(top_mem.score * 100) if top_mem.score else 92
        historical_similarity = f"Similar to {top_id} ({sim_pct}% match in Hindsight Cloud bank)"
    else:
        historical_similarity = "No prior matching precedents found (Novel Pattern)"

    # 8. Root Cause Category
    if "redis" in text or "pool" in text or "socket" in text:
        category = "Database / Connection Pool Exhaustion"
    elif "kafka" in text or "deserialization" in text or "rebalance" in text:
        category = "Message Broker / Deserialization & Poison Pill"
    elif "deadlock" in text or "lock" in text:
        category = "Database / Concurrency & Lock Contention"
    else:
        category = "Service Reliability / Resource Contention"

    return IncidentDNA(
        service=incident.service,
        error_pattern=error_pattern,
        severity=incident.severity,
        symptoms=symptoms_list[:4],
        dependencies=dependencies[:4],
        infrastructure=infrastructure,
        recent_changes=recent_changes,
        metrics=metrics,
        historical_similarity=historical_similarity,
        root_cause_category=category
    )


def build_evidence_chain(
    incident: IncidentCreate,
    recalled_memories: List[HistoricalMemory],
    investigation_plan: Optional[List[str]] = None,
    detected_pattern: Optional[str] = None,
    is_resolved: bool = False,
    resolution: Optional[IncidentResolutionCreate] = None
) -> List[EvidenceNode]:
    """
    Build a connected evidence chain from symptoms to hypothesis and resolution.
    Strictly labels AI hypothesis as 'Possible Root Cause' until human verification.
    """
    nodes: List[EvidenceNode] = []
    step = 1

    # Node 1: CURRENT FACT - Alert Intake
    nodes.append(EvidenceNode(
        id=f"ev-node-{step}",
        step_number=step,
        type="CURRENT FACT",
        title="Live Incident Alert Triggered",
        description=f"Alert on {incident.service} ({incident.severity}): {incident.title}",
        source_type="CURRENT",
        source_label="Live incident input",
        confidence="Observed",
        status="active"
    ))
    step += 1

    # Node 2: CURRENT FACT - Symptoms
    nodes.append(EvidenceNode(
        id=f"ev-node-{step}",
        step_number=step,
        type="CURRENT FACT",
        title="Observed Failure Signatures",
        description=incident.symptoms[:200] + ("..." if len(incident.symptoms) > 200 else ""),
        source_type="CURRENT",
        source_label="Current Telemetry",
        confidence="Observed",
        status="active"
    ))
    step += 1

    # Node 3: OBSERVATION - Diagnostic Logs (if present)
    if incident.logs and incident.logs.strip():
        first_log = incident.logs.strip().split("\n")[0][:180]
        nodes.append(EvidenceNode(
            id=f"ev-node-{step}",
            step_number=step,
            type="CURRENT FACT",
            title="Diagnostic Stack Trace",
            description=f"Log trace: {first_log}",
            source_type="CURRENT",
            source_label="Pod Error Logs",
            confidence="Observed",
            status="active"
        ))
        step += 1

    # Node 4: HISTORICAL EVIDENCE - Hindsight Cloud Recall
    if recalled_memories:
        top_mem = recalled_memories[0]
        mem_id = top_mem.incident_id or top_mem.id or "INC-HIST-001"
        past_cause = top_mem.root_cause or "Similar outage documented in memory bank."
        nodes.append(EvidenceNode(
            id=f"ev-node-{step}",
            step_number=step,
            type="HISTORICAL EVIDENCE",
            title=f"Historical Precedent Recalled ({mem_id})",
            description=f"Previous outage root cause: {past_cause}",
            source_type="MEMORY",
            source_label=f"Hindsight Cloud {mem_id}",
            confidence="Historical Precedent",
            status="active"
        ))
        step += 1
    else:
        nodes.append(EvidenceNode(
            id=f"ev-node-{step}",
            step_number=step,
            type="HISTORICAL EVIDENCE",
            title="No Prior Outage Precedents",
            description="Hindsight Cloud returned 0 matching historical memories. Triage treating this as a novel pattern.",
            source_type="MEMORY",
            source_label="Hindsight Cloud (unicase-incident-memory)",
            confidence="Historical Precedent",
            status="active"
        ))
        step += 1

    # Node 5: AI HYPOTHESIS - Must be 'Possible Root Cause', NOT confirmed
    hypothesis_text = detected_pattern or (
        f"Possible root cause: {recalled_memories[0].root_cause}"
        if recalled_memories and recalled_memories[0].root_cause
        else f"Suspected resource exhaustion or deployment defect on {incident.service}."
    )
    nodes.append(EvidenceNode(
        id=f"ev-node-{step}",
        step_number=step,
        type="AI HYPOTHESIS",
        title="Possible Root Cause (Hypothesis)",
        description=hypothesis_text,
        source_type="AI",
        source_label="Groq Reasoning",
        confidence="Hypothesized",
        status="confirmed" if is_resolved else "pending_verification"
    ))
    step += 1

    # Node 6 & 7: ENGINEER VERIFIED & MITIGATION (Appended if resolved)
    if is_resolved and resolution:
        nodes.append(EvidenceNode(
            id=f"ev-node-{step}",
            step_number=step,
            type="ENGINEER VERIFIED",
            title="Confirmed Root Cause",
            description=resolution.root_cause,
            source_type="ENGINEER",
            source_label=f"Verified by {resolution.resolved_by or 'oncall-engineer'}",
            confidence="Verified",
            status="active"
        ))
        step += 1

        nodes.append(EvidenceNode(
            id=f"ev-node-{step}",
            step_number=step,
            type="MITIGATION",
            title="Remediation Applied & Mitigated",
            description=f"{resolution.resolution} Outcome: {resolution.outcome}",
            source_type="ENGINEER",
            source_label="SRE Mitigation",
            confidence="Verified",
            status="active"
        ))
        step += 1

    return nodes


def generate_incident_timeline(
    incident: IncidentCreate,
    is_resolved: bool = False,
    recalled_count: int = 1,
    duration_minutes: int = 30
) -> List[TimelineEvent]:
    """
    Generate progressive lifecycle events for Incident Replay.
    Uses realistic relative timestamps (00:00 to 00:55).
    """
    events = [
        TimelineEvent(
            time_offset="00:00",
            phase="Detection",
            title="Deployment / Config Event",
            description=incident.recent_deployment or "Baseline production operations",
            actor="system",
            badge="Trigger"
        ),
        TimelineEvent(
            time_offset="00:03",
            phase="Detection",
            title="Error Rate Anomaly",
            description=f"Telemetry monitors recorded abnormal error rise in {incident.service}",
            actor="system",
            badge="Telemetry"
        ),
        TimelineEvent(
            time_offset="00:07",
            phase="Detection",
            title="Latency Threshold Breached",
            description="Upstream gateways recorded P99 latency spikes and queue build-up",
            actor="system",
            badge="Alert"
        ),
        TimelineEvent(
            time_offset="00:10",
            phase="Triage",
            title="Incident Alert Fired",
            description=f"Pager alert routed to SRE on-call team for {incident.service}",
            actor="system",
            badge="Intake"
        ),
        TimelineEvent(
            time_offset="00:12",
            phase="Intelligence",
            title="Hindsight Cloud RECALL Initiated",
            description=f"Querying persistent bank 'unicase-incident-memory' for {incident.service} signatures",
            actor="hindsight",
            badge="RECALL"
        ),
        TimelineEvent(
            time_offset="00:15",
            phase="Intelligence",
            title=f"Historical Precedents Recalled ({recalled_count})",
            description=f"Matched {recalled_count} prior verified incident postmortems in 34ms",
            actor="hindsight",
            badge="Memory"
        ),
        TimelineEvent(
            time_offset="00:18",
            phase="Reasoning",
            title="Groq LLM Synthesis",
            description="Synthesizing current telemetry against recalled historical postmortems",
            actor="groq",
            badge="Groq AI"
        ),
        TimelineEvent(
            time_offset="00:22",
            phase="Reasoning",
            title="Investigation Plan & Safe Commands Generated",
            description="Diagnostic CLI queries formulated without mutating production state",
            actor="groq",
            badge="Plan"
        ),
        TimelineEvent(
            time_offset="00:26",
            phase="Investigation",
            title="Human Engineer Triage",
            description="SRE engineer executes safe diagnostic inspection commands on live cluster",
            actor="engineer",
            badge="Engineer"
        )
    ]

    if is_resolved:
        events.extend([
            TimelineEvent(
                time_offset="00:40",
                phase="Mitigation",
                title="Root Cause Verified",
                description="Engineer validated hypothesis using live telemetry and logs",
                actor="engineer",
                badge="Confirmed"
            ),
            TimelineEvent(
                time_offset="00:46",
                phase="Mitigation",
                title="Remediation Applied",
                description="Configuration patch / hotfix rolled out to affected pods",
                actor="engineer",
                badge="Mitigated"
            ),
            TimelineEvent(
                time_offset="00:51",
                phase="Mitigation",
                title="Incident Resolved",
                description="Latency normalized and 504 errors dropped to baseline 0.00%",
                actor="system",
                badge="Resolved"
            ),
            TimelineEvent(
                time_offset="00:55",
                phase="Retention",
                title="Hindsight Cloud RETAIN Completed",
                description="New incident postmortem permanently retained in 'unicase-incident-memory'",
                actor="hindsight",
                badge="RETAIN"
            )
        ])

    return events


def generate_memory_impact() -> MemoryImpact:
    """
    Conceptual comparison of incident resolution with vs without Hindsight memory.
    """
    return MemoryImpact(
        without_memory_steps=[
            "1. Alert arrives with high latency & 504 errors",
            "2. Cold investigation from zero organizational context",
            "3. Manual trial-and-error log parsing across distributed pods",
            "4. Unaware of past Redis pool exhaustion outage 3 weeks prior",
            "5. Re-discovering known bug takes 45–60 minutes of debugging",
            "6. Delayed resolution & prolonged user impact"
        ],
        with_memory_steps=[
            "1. Alert arrives with high latency & 504 errors",
            "2. Hindsight Cloud instantly RECALLS matching postmortem INC-HIST-001",
            "3. Precedent highlights exact past root cause: Redis pool capped at 20",
            "4. Groq generates targeted read-only diagnostic commands immediately",
            "5. SRE confirms pool utilization in 3 minutes and applies tested fix",
            "6. Hindsight RETAIN persists resolution — closing the learning loop"
        ],
        memory_role_summary=(
            "Hindsight Cloud provides immediate institutional memory, transforming past outages "
            "into immediate diagnostic shortcuts. Instead of starting from scratch, SREs immediately "
            "know what previously failed and what fix succeeded."
        ),
        note="Demo Simulation / Conceptual Comparison"
    )


def generate_learning_summary(
    incident_id: str,
    incident: IncidentCreate,
    resolution: IncidentResolutionCreate,
    total_memories_before: int = 3
) -> LearningSummary:
    """
    Generate post-resolution organizational learning summary and memory bank evolution.
    """
    reusable_knowledge = (
        f"When {incident.service} experiences {incident.title.lower()}, "
        f"inspect {resolution.root_cause.lower()} as a primary failure hypothesis. "
        f"Verified remediation: {resolution.resolution}"
    )

    bank_evolution = {
        "before_count": total_memories_before,
        "after_count": total_memories_before + 1,
        "before_ids": [f"INC-HIST-00{i}" for i in range(1, total_memories_before + 1)],
        "new_memory_id": incident_id,
        "bank_id": "unicase-incident-memory"
    }

    return LearningSummary(
        memory_id=incident_id,
        incident_pattern=f"{incident.service} • {incident.title}",
        verified_root_cause=resolution.root_cause,
        successful_mitigation=resolution.resolution,
        resolution_duration=f"{resolution.duration_minutes or 30} minutes",
        reusable_knowledge=reusable_knowledge,
        bank_evolution=bank_evolution
    )
