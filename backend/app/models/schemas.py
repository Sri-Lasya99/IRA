from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class IncidentCreate(BaseModel):
    title: str = Field(..., description="Short incident summary")
    service: str = Field(..., description="Affected service, e.g. payment-service")
    severity: str = Field(default="P2 - High", description="P1 - Critical, P2 - High, P3 - Medium, P4 - Low")
    symptoms: str = Field(..., description="Observable symptoms, error codes, metrics")
    logs: Optional[str] = Field(default="", description="Relevant stack traces, log snippets, or metrics")
    environment: str = Field(default="production", description="Environment affected")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags such as redis, latency, 504")
    recent_deployment: Optional[str] = Field(default="", description="Recent code deployment or configuration change")
    hindsight_enabled: bool = Field(default=True, description="Enable or disable Hindsight organizational memory recall")
    memory_mode: Optional[str] = Field(default="on", description="Memory mode: 'on' or 'off'")

class HistoricalMemory(BaseModel):
    id: Optional[str] = None
    content: str
    fact_type: Optional[str] = "experience"
    score: Optional[float] = None
    context: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    # Structured incident fields extracted from memory
    incident_id: Optional[str] = None
    title: Optional[str] = None
    date: Optional[str] = None
    date_display: Optional[str] = None
    service: Optional[str] = None
    severity: Optional[str] = None
    environment: Optional[str] = None
    symptoms: Optional[str] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    outcome: Optional[str] = None
    successful_fixes: Optional[List[str]] = None
    failed_fixes: Optional[List[str]] = None
    relevance_reason: Optional[str] = None
    similarity_factors: Optional[Dict[str, Any]] = None
    similarity_explanation: Optional[str] = None

class IncidentDNA(BaseModel):
    service: str
    error_pattern: str
    severity: str
    symptoms: List[str]
    dependencies: List[str]
    infrastructure: str
    recent_changes: str
    metrics: Dict[str, str]
    historical_similarity: str
    root_cause_category: str

class EvidenceNode(BaseModel):
    id: str
    step_number: int
    type: str  # CURRENT FACT, OBSERVATION, HISTORICAL EVIDENCE, AI HYPOTHESIS, ENGINEER VERIFIED, MITIGATION
    title: str
    description: str
    source_type: str  # CURRENT, MEMORY, AI, ENGINEER
    source_label: str
    confidence: str  # Observed, Historical Precedent, Hypothesized, Verified
    status: str = "active"

class TimelineEvent(BaseModel):
    time_offset: str
    phase: str
    title: str
    description: str
    actor: str  # system, hindsight, groq, engineer
    badge: Optional[str] = None

class MemoryImpact(BaseModel):
    without_memory_steps: List[str]
    with_memory_steps: List[str]
    memory_role_summary: str
    note: str = "Demo Simulation / Conceptual Comparison"

class LearningSummary(BaseModel):
    memory_id: Optional[str] = None
    incident_pattern: str
    verified_root_cause: str
    successful_mitigation: str
    resolution_duration: str
    reusable_knowledge: str
    bank_evolution: Dict[str, Any]

class ChronologicalFixItem(BaseModel):
    action: str
    status: str = Field(description="'worked', 'failed', or 'unrecorded'")
    notes: Optional[str] = None

class ResolutionHistoryEntry(BaseModel):
    incident_id: str
    date_display: Optional[str] = None
    title: Optional[str] = None
    service: Optional[str] = None
    fixes: List[ChronologicalFixItem] = Field(default_factory=list)
    system_changes: Optional[str] = None
    outcome: Optional[str] = None

class TemporalReasoning(BaseModel):
    has_sufficient_history: bool = Field(default=False)
    resolution_history: List[ResolutionHistoryEntry] = Field(default_factory=list)
    temporal_insight: str = Field(default="")
    recommended_approach: str = Field(default="")
    alternative_historical_approach: Optional[str] = Field(default=None)
    why: str = Field(default="")
    status_notice: Optional[str] = Field(default=None)

class InvestigationReport(BaseModel):
    incident_summary: str
    current_incident_facts: List[str]
    historical_evidence: List[str]
    detected_pattern: str
    investigation_plan: List[str]
    recommended_next_steps: List[str]
    historical_relevance_notes: Optional[Dict[str, str]] = Field(default_factory=dict)
    incident_dna: Optional[IncidentDNA] = None
    evidence_chain: Optional[List[EvidenceNode]] = None
    incident_timeline: Optional[List[TimelineEvent]] = None
    memory_impact: Optional[MemoryImpact] = None
    temporal_reasoning: Optional[TemporalReasoning] = None
    memory_mode: str = Field(default="on", description="'on' or 'off'")
    memory_used: bool = Field(default=True, description="True if Hindsight memory was recalled and used")
    historical_incidents_count: int = Field(default=0, description="Count of historical precedents retrieved")
    memory_error: Optional[str] = Field(default=None, description="Error message if Hindsight failed")
    memory_impact_statement: Optional[str] = Field(default=None, description="Human explanation of memory impact")
    safety_disclaimer: str = (
        "AI Incident Response Agent provides diagnostic decision-support only. "
        "It does NOT execute automated production mutations or repairs. All diagnostic actions "
        "must be reviewed and performed by authorized engineering personnel."
    )

class IncidentResolutionCreate(BaseModel):
    root_cause: str = Field(..., description="Confirmed root cause after investigation")
    resolution: str = Field(..., description="Actions and fixes applied to resolve the incident")
    outcome: str = Field(..., description="Observed outcome after applying resolution (e.g. latency normalized)")
    recent_deployment: Optional[str] = Field(default="", description="Relevant deployment or configuration change")
    resolved_by: str = Field(default="oncall-engineer", description="Engineer handle or name")
    duration_minutes: Optional[int] = Field(default=30, description="Estimated time to resolution in minutes")

class IncidentRecord(BaseModel):
    id: str
    title: str
    service: str
    severity: str
    symptoms: str
    logs: Optional[str] = ""
    environment: str = "production"
    tags: List[str] = []
    recent_deployment: Optional[str] = ""
    status: str = "active" # active, investigating, resolved
    created_at: str
    resolved_at: Optional[str] = None
    recalled_memories: List[HistoricalMemory] = []
    investigation_report: Optional[InvestigationReport] = None
    incident_dna: Optional[IncidentDNA] = None
    evidence_chain: Optional[List[EvidenceNode]] = None
    incident_timeline: Optional[List[TimelineEvent]] = None
    memory_impact: Optional[MemoryImpact] = None
    temporal_reasoning: Optional[TemporalReasoning] = None
    learning_summary: Optional[LearningSummary] = None
    resolution: Optional[IncidentResolutionCreate] = None
    retained_in_hindsight: bool = False
    hindsight_operation_id: Optional[str] = None
    memory_mode: str = "on"
    memory_used: bool = True
    historical_incidents_count: int = 0
    memory_error: Optional[str] = None

class IncidentCompareResponse(BaseModel):
    incident_id: str
    off_result: IncidentRecord
    on_result: IncidentRecord
    comparison_summary: Dict[str, Any]

class RecallPreviewRequest(BaseModel):
    query: str
    service: Optional[str] = None
    tags: Optional[List[str]] = None

class HealthResponse(BaseModel):
    status: str
    hindsight_cloud: Dict[str, Any]
    groq_api: Dict[str, Any]
    timestamp: str

# ── Agent Learning Curve Models ─────────────────────────────────

class LearningCurveDataPoint(BaseModel):
    incidents_count: int
    batch_label: str
    success_rate: float
    failed_fix_avoidance_rate: float
    baseline_rate: float = 40.0
    correct_recommendations: int
    total_evaluated: int
    recurring_patterns_recognized: int
    failed_patterns_avoided: int

class LearningCurveStatistics(BaseModel):
    total_incidents_learned: int
    initial_success_rate: float
    current_success_rate: float
    performance_gain: float
    failed_fix_avoidance_rate: float
    baseline_success_rate: float = 40.0
    precedent_recognition_rate: float

class LearningCurveResponse(BaseModel):
    title: str = "Agent Learning Curve"
    subtitle: str = "How incident-resolution performance changes as the agent accumulates experience."
    metric_name: str = "Resolution Recommendation Success Rate"
    data_points: List[LearningCurveDataPoint]
    statistics: LearningCurveStatistics
    learning_insight: str

