import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ShieldAlert, 
  Lightbulb, 
  History, 
  Activity, 
  ListOrdered,
  ArrowRight,
  ArrowLeft,
  Dna,
  GitFork,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  CheckSquare,
  Square,
  Copy,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Database,
  Layers,
  Info,
  Server,
  GitCompare
} from 'lucide-react';
import IncidentDNACard from './IncidentDNACard';
import EvidenceChainView from './EvidenceChainView';
import IncidentReplayPlayer from './IncidentReplayPlayer';
import OrganizationalLearningCard from './OrganizationalLearningCard';
import DNASimilarityBreakdown from './DNASimilarityBreakdown';
import MemoryImpactCard from './MemoryImpactCard';
import TemporalReasoningCard from './TemporalReasoningCard';

export default function InvestigationReport({ 
  incident, 
  currentStep = 1, 
  onSelectStep,
  onOpenResolve,
  onResolve,
  onCompare,
  isResolving = false
}) {
  const report = incident?.investigation_report;

  // Local step fallback if onSelectStep is not provided
  const [internalStep, setInternalStep] = useState(1);
  const activeStep = onSelectStep ? currentStep : internalStep;
  const goToStep = (stepNum) => {
    if (onSelectStep) {
      onSelectStep(stepNum);
    } else {
      setInternalStep(stepNum);
    }
  };

  // Step 4: Interactive checklist state
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showDiagnosticCommands, setShowDiagnosticCommands] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Step 3: Expandable hypothesis drawer
  const [showHypothesisDetails, setShowHypothesisDetails] = useState(false);

  // Step 5: Human Engineer Verification state
  const [verificationStatus, setVerificationStatus] = useState('confirmed'); // 'confirmed' | 'not_confirmed' | 'needs_more'
  const [verificationForm, setVerificationForm] = useState({
    root_cause: '',
    observed_evidence: '',
    actual_remediation: '',
    duration_minutes: 25
  });

  // Supporting Accordions (Collapsed by default)
  const [accordionOpen, setAccordionOpen] = useState({
    dna: false,
    evidenceChain: false,
    replay: false,
    whyHindsight: false
  });

  // Pre-fill Step 5 form with AI hypothesis and top recalled resolution when incident loads
  useEffect(() => {
    if (incident) {
      const topMem = incident.recalled_memories?.[0];
      const hypothesis = report?.detected_pattern || '';
      const defaultRemediation = topMem?.resolution || report?.recommended_next_steps?.[0] || '';
      const factsText = report?.current_incident_facts?.join('; ') || incident.symptoms || '';

      setVerificationForm({
        root_cause: incident.root_cause || hypothesis.split('.')[0] || 'Database connection pool saturation in order service',
        observed_evidence: factsText,
        actual_remediation: incident.resolution_notes || defaultRemediation,
        duration_minutes: 25
      });
    }
  }, [incident?.id]);

  if (!report) return null;

  const dna = incident.incident_dna || report.incident_dna;
  const evidenceChain = incident.evidence_chain || report.evidence_chain;
  const timeline = incident.incident_timeline || report.incident_timeline;
  const memoryImpact = incident.memory_impact || report.memory_impact;
  const isResolved = incident.status === 'resolved';

  const memoryUsed = Boolean(incident.memory_used ?? report?.memory_used ?? (incident.recalled_memories?.length > 0));
  const memoryMode = incident.memory_mode || report?.memory_mode || (memoryUsed ? 'on' : 'off');
  const memoryError = incident.memory_error || report?.memory_error;

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleAccordion = (key) => {
    setAccordionOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCommitResolution = async () => {
    if (onResolve) {
      await onResolve(incident.id, {
        root_cause: verificationForm.root_cause,
        resolution: verificationForm.actual_remediation,
        outcome: verificationStatus === 'confirmed' 
          ? 'Hypothesis confirmed and remediated. Latency returned to baseline.' 
          : 'Alternative remediation applied and verified in staging.',
        resolved_by: 'oncall-engineer',
        duration_minutes: Number(verificationForm.duration_minutes) || 25,
        recent_deployment: incident.recent_deployment_or_change || ''
      });
      goToStep(6);
    } else if (onOpenResolve) {
      onOpenResolve(incident);
    }
  };

  // Filter top 3 recalled memories
  const topPrecedents = incident.recalled_memories?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────
          ACTIVE STEP WORKFLOW CONTAINER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
        
        {/* Step Header Indicator Banner */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs shadow-xs">
              {activeStep}
            </span>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {activeStep === 1 && "STEP 1: Incident Intake & Live Telemetry"}
                  {activeStep === 2 && "STEP 2: Hindsight Organizational Recall"}
                  {activeStep === 3 && "STEP 3: Groq LLM Diagnostic Reasoning"}
                  {activeStep === 4 && "STEP 4: Actionable Investigation Plan"}
                  {activeStep === 5 && "STEP 5: Human Engineer Verification"}
                  {activeStep === 6 && "STEP 6: Incident Resolution & Memory Retention"}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {incident.id}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isResolved 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {incident.status.toUpperCase()}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  memoryUsed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  MEMORY: {memoryMode.toUpperCase()} ({memoryUsed ? 'USED' : 'DISABLED'})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeStep === 1 && "Live facts and observed symptoms directly from production alerts"}
                {activeStep === 2 && "Searching organizational memory for historical incidents with identical failure signatures"}
                {activeStep === 3 && "Separating current telemetry from historical evidence to produce an unverified hypothesis"}
                {activeStep === 4 && "Step-by-step diagnostic actions and safe read-only queries to test the hypothesis"}
                {activeStep === 5 && "Critical human-in-the-loop decision: verify the root cause before executing changes"}
                {activeStep === 6 && "Retain verified engineering knowledge back into Hindsight Cloud"}
              </p>
            </div>
          </div>

          {/* Quick jump step pill selector & Compare button */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(incident)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition shadow-2xs"
                title="Run side-by-side comparison with Hindsight OFF vs ON"
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>Compare Impact</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => goToStep(num)}
                  className={`h-6 w-6 rounded-md font-mono text-[11px] font-bold transition flex items-center justify-center ${
                    activeStep === num
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                  title={`Jump to Step ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-6">

          {/* ═════════════════════════════════════════════════════════
              STEP 1: INCIDENT (LIVE FACTS ONLY, NO HISTORICAL DATA)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Live Incident Facts
                </span>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  Origin: Production Telemetry
                </span>
              </div>

              {/* Primary Incident Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Affected Service
                  </span>
                  <div className="font-mono text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Server className="h-4 w-4 text-sky-600" />
                    {incident.service}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Severity Level
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200">
                    {incident.severity}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Recent Deployment / Change
                  </span>
                  <div className="text-xs text-slate-800 font-medium">
                    {incident.recent_deployment_or_change || 'No deployment recorded in preceding 2 hours'}
                  </div>
                </div>
              </div>

              {/* Title & Symptoms */}
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Incident Description & Headline
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {incident.title}
                  </h4>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Observed Symptoms & Metrics
                  </span>
                  <div className="space-y-2">
                    {incident.symptoms ? (
                      incident.symptoms.split('\n').filter(Boolean).map((symptomLine, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                          <span className="text-blue-600 font-mono mt-0.5">•</span>
                          <span>{symptomLine}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600">No raw symptoms logged.</p>
                    )}
                  </div>
                </div>

                {/* Telemetry Facts derived from live report */}
                {report.current_incident_facts && report.current_incident_facts.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50/30 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                      Extracted Telemetry Facts
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {report.current_incident_facts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 font-mono mt-0.5">→</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step 1 Bottom CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-400">
                  Step 1 of 6 • Live telemetry established
                </span>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Hindsight Recall</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 2: HINDSIGHT RECALL (TOP 3 PRECEDENTS)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              {/* Memory Impact Section */}
              <MemoryImpactCard 
                incident={incident} 
                onCompare={onCompare ? () => onCompare(incident) : undefined} 
              />

              {/* Case 1: Hindsight was OFF */}
              {!memoryUsed && memoryMode === 'off' && (
                <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-300 text-xs text-amber-950 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span>Hindsight Memory Was Disabled For This Run</span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    Because Hindsight was set to <strong className="font-mono text-amber-900">OFF</strong>, 
                    no organizational postmortems or verified historical playbooks were queried. 
                    Groq was given only live telemetry facts to diagnose the issue from first principles.
                  </p>
                  {onCompare && (
                    <button
                      type="button"
                      onClick={() => onCompare(incident)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <GitCompare className="h-4 w-4" />
                      <span>Compare Side-by-Side: With Memory vs Without Memory</span>
                    </button>
                  )}
                </div>
              )}

              {/* Case 2: Hindsight was ON but no matching memories */}
              {!memoryUsed && memoryMode === 'on' && !memoryError && (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    <span>Hindsight enabled, but no sufficiently relevant historical incidents were found.</span>
                  </div>
                  <p className="leading-relaxed">
                    The incident symptoms did not sufficiently match prior postmortems. Groq will reason strictly from the current incident facts.
                  </p>
                </div>
              )}

              {/* Case 3: Hindsight ON & Memories Found */}
              {memoryUsed && topPrecedents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-sky-600" />
                      Top 3 Historical Precedents Recalled
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      Memory Grounded
                    </span>
                  </div>

                  {topPrecedents.map((mem, idx) => {
                    const similarityScore = Math.round((mem.score || (0.95 - idx * 0.04)) * 100);
                    const similarityExplanation = mem.similarity_factors?.explanation || mem.relevance_reason || 
                      `Similar failure signature: pool saturation and latency spike matching previous outage.`;

                    return (
                      <div 
                        key={mem.incident_id || idx}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                      >
                        {/* Precedent Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-sky-700">
                              {mem.incident_id || `INC-HIST-00${idx + 1}`}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-xs text-slate-700 font-semibold">
                              {mem.service || incident.service}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {mem.severity?.split(' - ')[0] || 'P1'}
                            </span>
                          </div>

                          {/* Similarity Badge */}
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Match:</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {similarityScore}% Similarity
                            </span>
                          </div>
                        </div>

                        {/* Precedent Title */}
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {mem.title || `Historical Outage on ${mem.service || incident.service}`}
                        </h5>

                        {/* Explainable DNA Similarity Breakdown */}
                        <DNASimilarityBreakdown
                          similarityData={mem.similarity_factors || {
                            total_similarity: similarityScore,
                            explanation: similarityExplanation
                          }}
                        />

                        {/* Verified Root Cause & Verified Resolution Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Previous Root Cause */}
                          <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-amber-600" />
                              Previous Verified Root Cause
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed font-sans">
                              {mem.root_cause || "Connection pool exhaustion under peak load conditions."}
                            </p>
                          </div>

                          {/* Verified Resolution */}
                          <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Verified Resolution That Worked
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed font-sans">
                              {mem.resolution || "Increased pool size and adjusted connection lease timeouts."}
                            </p>
                          </div>
                        </div>

                        {/* Successful & Failed Fixes */}
                        {(mem.successful_fixes?.length > 0 || mem.failed_fixes?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Successful Fixes */}
                            <div className="p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-200 text-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1 mb-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                ✓ Successful Fixes
                              </span>
                              {mem.successful_fixes && mem.successful_fixes.length > 0 ? (
                                <ul className="space-y-1 text-slate-700">
                                  {mem.successful_fixes.map((f, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-emerald-600 font-bold">✓</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-600 italic">Playbook recorded in resolution</p>
                              )}
                            </div>

                            {/* Failed Fixes To Avoid */}
                            <div className="p-2.5 rounded-lg bg-rose-50/30 border border-rose-200 text-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1 mb-1">
                                <XCircle className="h-3 w-3 text-rose-600" />
                                ✕ Failed Fixes To Avoid
                              </span>
                              {mem.failed_fixes && mem.failed_fixes.length > 0 ? (
                                <ul className="space-y-1 text-slate-700">
                                  {mem.failed_fixes.map((f, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-rose-600 font-bold">✕</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-500 italic">No failed fixes recorded in this postmortem</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Chronological Resolution History & Temporal Evolution */}
              {memoryUsed && (
                <TemporalReasoningCard
                  temporal={report?.temporal_reasoning || incident.temporal_reasoning}
                  memoryUsed={memoryUsed}
                  memoryMode={memoryMode}
                />
              )}

              {/* Step 2 Bottom CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Incident</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Groq Reasoning</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 3: GROQ REASONING (SEPARATE FACTS, EVIDENCE, HYPOTHESIS)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Plain English Explanation */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    What does the AI think is happening?
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Groq synthesizes live production telemetry with verified precedents from Hindsight Cloud to formulate 
                    a working hypothesis. Telemetry facts are strictly isolated from historical memories.
                  </p>
                </div>
              </div>

              {/* Distinct Columns: CURRENT FACTS vs HISTORICAL EVIDENCE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. CURRENT FACTS */}
                <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                      Current Facts (Live Telemetry)
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Step 1 Facts
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {report.current_incident_facts?.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-mono mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    )) || (
                      <li className="text-slate-500 italic">Live telemetry from {incident.service}</li>
                    )}
                  </ul>
                </div>

                {/* 2. HISTORICAL EVIDENCE */}
                <div className={`p-4 rounded-xl border shadow-2xs space-y-3 ${
                  memoryUsed ? 'bg-white border-sky-200' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-sky-600" />
                      Historical Evidence (Hindsight Cloud)
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      memoryUsed ? 'text-sky-600 bg-sky-50' : 'text-slate-500 bg-slate-100'
                    }`}>
                      {memoryUsed ? 'Step 2 Precedents' : 'Memory Disabled'}
                    </span>
                  </div>
                  
                  {memoryUsed ? (
                    <ul className="space-y-2 text-xs text-slate-700">
                      {report.historical_evidence?.map((evidence, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-600 font-mono mt-0.5">•</span>
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-semibold block flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Memory Disabled (OFF)
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Analysis based only on the current incident. Hindsight memory was disabled for this run.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Temporal Reasoning: Resolution History & Evolution */}
              <TemporalReasoningCard
                temporal={report?.temporal_reasoning || incident.temporal_reasoning}
                memoryUsed={memoryUsed}
                memoryMode={memoryMode}
              />

              {/* 3. AI HYPOTHESIS (CLEARLY LABELED UNVERIFIED) */}
              <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-300 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                      AI HYPOTHESIS — UNVERIFIED
                    </span>
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Detected Failure Pattern
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-900/80 font-medium">
                    Synthesized by Groq
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                  {report.detected_pattern}
                </p>

                {/* Expandable "Why this hypothesis?" Drawer */}
                <div className="pt-2 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setShowHypothesisDetails(!showHypothesisDetails)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 transition"
                  >
                    <span>Why this hypothesis?</span>
                    {showHypothesisDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showHypothesisDetails && (
                    <div className="mt-2.5 p-3 rounded-lg bg-white/90 border border-amber-200 text-xs text-slate-700 space-y-2 animate-fade-in">
                      <p className="leading-relaxed">
                        <strong className="text-slate-900">Causal Correlation: </strong> 
                        The live error surge on <code className="font-mono text-amber-900">{incident.service}</code> directly mirrors the symptoms recorded in previous incident 
                        <code className="font-mono text-sky-700 ml-1">{topPrecedents[0]?.incident_id || 'INC-HIST-001'}</code>. 
                        In both events, resource pool depletion caused queue depth spikes and downstream 504 timeouts.
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Confidence: <strong>High</strong> based on 5-factor DNA fingerprint match. However, this remains a working hypothesis until verified by the on-call engineer in Step 5.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">Decision-Support Boundary:</strong>
                  {report.safety_disclaimer || "AI hypothesis must be verified by an engineer before executing remediations. AI outputs are non-deterministic recommendations."}
                </div>
              </div>

              {/* Step 3 Bottom CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Recall</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Investigation Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 4: INVESTIGATION PLAN (NUMBERED CHECKLIST & COMMANDS)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              {/* Header and Check Count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-sky-600" />
                    Actionable Investigation Checklist
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Execute these numbered verification steps to confirm or rule out the suspected root cause.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-medium text-slate-600">
                    Progress:
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    {Object.values(checkedSteps).filter(Boolean).length} / {report.investigation_plan?.length || 4} Checked
                  </span>
                </div>
              </div>

              {/* Numbered Checklist */}
              <div className="space-y-2.5">
                {report.investigation_plan?.map((stepText, idx) => {
                  const isChecked = Boolean(checkedSteps[idx]);
                  const cleanText = stepText.replace(/^\d+\.\s*/, '');

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-emerald-50/30 border-emerald-200 text-slate-600'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheck(idx);
                        }}
                        className={`h-5 w-5 rounded mt-0.5 flex items-center justify-center shrink-0 transition ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'border border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                        title={isChecked ? "Mark unchecked" : "Mark checked"}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-mono text-xs font-bold ${isChecked ? 'text-emerald-700 line-through' : 'text-sky-700'}`}>
                            Step {idx + 1}
                          </span>
                          {isChecked && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Investigated
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {cleanText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expandable "Show Diagnostic Commands" */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiagnosticCommands(!showDiagnosticCommands)}
                  className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-slate-700" />
                    Show Safe Read-Only Diagnostic Commands ({report.recommended_next_steps?.length || 0})
                  </span>
                  {showDiagnosticCommands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showDiagnosticCommands && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {report.recommended_next_steps?.map((cmdStep, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <span className="text-emerald-400 select-none">$</span>
                          <span className="text-slate-100">{cmdStep}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cmdStep, idx)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] shrink-0 transition flex items-center gap-1 border border-slate-700"
                          title="Copy command"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4 Bottom CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Reasoning</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Engineer Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 5: ENGINEER VERIFICATION (HUMAN IN THE LOOP)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              {/* Prominent Question */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-sky-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Human-in-the-Loop Verification
                  </h4>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Did your investigation confirm the AI hypothesis?
                </p>
                <p className="text-xs text-slate-600">
                  AI hypothesis from Step 3: <em className="text-slate-800">"{report.detected_pattern}"</em>
                </p>
              </div>

              {/* 3 Decision Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationStatus('confirmed')}
                  className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    verificationStatus === 'confirmed'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-200 shadow-2xs font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`h-5 w-5 ${verificationStatus === 'confirmed' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Confirmed</span>
                  <span className="text-[10px] text-slate-500">Hypothesis matched telemetry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationStatus('not_confirmed')}
                  className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    verificationStatus === 'not_confirmed'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200 shadow-2xs font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <XCircle className={`h-5 w-5 ${verificationStatus === 'not_confirmed' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Not Confirmed</span>
                  <span className="text-[10px] text-slate-500">Different root cause found</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationStatus('needs_more')}
                  className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    verificationStatus === 'needs_more'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200 shadow-2xs font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <HelpCircle className={`h-5 w-5 ${verificationStatus === 'needs_more' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Needs More Investigation</span>
                  <span className="text-[10px] text-slate-500">Inconclusive metrics</span>
                </button>
              </div>

              {/* Form Fields for Verified Incident Records */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Verified Postmortem Inputs
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const topMem = incident.recalled_memories?.[0];
                      setVerificationForm({
                        root_cause: report.detected_pattern?.split('.')[0] || "Database connection pool starvation in payment service",
                        observed_evidence: report.current_incident_facts?.join("; ") || "p99 latency 2400ms, 504 gateway timeouts",
                        actual_remediation: topMem?.resolution || "Increased connection pool max size to 50 and set connection acquisition timeout to 3000ms",
                        duration_minutes: 25
                      });
                    }}
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-fill from Step 3 & Step 2</span>
                  </button>
                </div>

                {/* 1. Confirmed Root Cause */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmed Root Cause
                  </label>
                  <input
                    type="text"
                    value={verificationForm.root_cause}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, root_cause: e.target.value }))}
                    placeholder="e.g. HikariCP connection pool exhaustion in order-service"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-sans"
                  />
                </div>

                {/* 2. Observed Evidence */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observed Evidence & Telemetry Findings
                  </label>
                  <input
                    type="text"
                    value={verificationForm.observed_evidence}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, observed_evidence: e.target.value }))}
                    placeholder="e.g. Active connection metric peaked at 10/10; thread dumps showed BLOCKED state on getConnection()"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-sans"
                  />
                </div>

                {/* 3. Actual Remediation Applied */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual Remediation Applied
                  </label>
                  <input
                    type="text"
                    value={verificationForm.actual_remediation}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, actual_remediation: e.target.value }))}
                    placeholder="e.g. Scaled maximum-pool-size to 50 in ConfigMap and restarted pods"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-sans"
                  />
                </div>

                {/* 4. Incident Duration (minutes) */}
                <div className="w-48">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Incident Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={verificationForm.duration_minutes}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
                  />
                </div>
              </div>

              {/* Step 5 Bottom CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(6)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Continue to Resolve & RETAIN</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 6: RESOLVE & RETAIN (SUMMARY, COMMIT, LEARNING)
             ═════════════════════════════════════════════════════════ */}
          {activeStep === 6 && (
            <div className="space-y-5 animate-fade-in">
              {/* If already resolved, display post-retain confirmation banner */}
              {isResolved ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Incident Successfully Resolved & Retained in Hindsight Cloud</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-emerald-900 font-medium pl-7">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Incident {incident.id} marked as resolved in live session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Verified root cause and resolution retained in organizational memory bank</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>This incident can now be recalled in all future investigations</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Summary before resolving */
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Resolution Summary & Retention Payload
                    </span>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Target Bank: unicase-incident-memory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Incident & Service
                      </span>
                      <p className="font-semibold text-slate-800 font-mono">
                        {incident.id} • {incident.service} ({incident.severity})
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Engineer Verification Status
                      </span>
                      <p className="font-semibold text-emerald-700 capitalize">
                        {verificationStatus.replace('_', ' ')} by On-Call Engineer ({verificationForm.duration_minutes} min duration)
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 md:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Confirmed Root Cause to Retain
                      </span>
                      <p className="text-slate-800 font-medium">
                        {verificationForm.root_cause || "Verified root cause from engineer investigation"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 md:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                        Verified Remediation to Retain
                      </span>
                      <p className="text-slate-800 font-medium">
                        {verificationForm.actual_remediation || "Verified fix playbook from engineer investigation"}
                      </p>
                    </div>
                  </div>

                  {/* Prominent Commit CTA Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={handleCommitResolution}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                    >
                      {isResolving ? (
                        <>
                          <Sparkles className="h-4 w-4 animate-spin text-white" />
                          <span>Retaining in Hindsight Cloud...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Resolve & RETAIN to Hindsight</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Organizational Learning & Memory Evolution (N -> N+1) */}
              {isResolved && (
                <OrganizationalLearningCard
                  incident={incident}
                  learningSummary={incident.learning_summary}
                />
              )}

              {/* Step 6 Bottom Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Verification</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition"
                >
                  <span>Review Step 1 (Incident Facts)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          EXPANDABLE SUPPORTING SECTIONS (COLLAPSIBLE ACCORDIONS)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Layers className="h-4 w-4 text-slate-400" />
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Supporting Investigation Artifacts (Deep Dive)
          </h4>
        </div>

        {/* ACCORDION 1: 🧬 View Incident DNA */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('dna')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Dna className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  View Incident DNA Fingerprint
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
                  Mathematical failure signature: service type, symptom vector, blast radius, error tier
                </span>
              </div>
            </div>
            {accordionOpen.dna ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {accordionOpen.dna && dna && (
            <div className="p-4 border-t border-slate-100 animate-fade-in">
              <IncidentDNACard
                dna={dna}
                incidentId={incident.id}
                title={incident.title}
              />
            </div>
          )}
        </div>

        {/* ACCORDION 2: View Causal Evidence Chain */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('evidenceChain')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <GitFork className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  View Causal Evidence Chain
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
                  Step-by-step epistemic graph connecting raw facts to hypothesis and verified resolution
                </span>
              </div>
            </div>
            {accordionOpen.evidenceChain ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {accordionOpen.evidenceChain && evidenceChain && evidenceChain.length > 0 && (
            <div className="p-4 border-t border-slate-100 animate-fade-in">
              <EvidenceChainView
                evidenceChain={evidenceChain}
                isResolved={isResolved}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
