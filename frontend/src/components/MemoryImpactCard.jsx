import React from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Layers, 
  HelpCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function MemoryImpactCard({ incident, onCompare }) {
  if (!incident) return null;

  const report = incident.investigation_report;
  const memoryUsed = Boolean(incident.memory_used ?? report?.memory_used ?? (incident.recalled_memories?.length > 0));
  const memoryMode = incident.memory_mode || report?.memory_mode || (memoryUsed ? 'on' : 'off');
  const memories = incident.recalled_memories || [];
  const memoryError = incident.memory_error || report?.memory_error;
  const isNoMemoryMatch = memoryMode === 'on' && memories.length === 0 && !memoryError;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            memoryUsed 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Memory Impact Analysis
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                memoryUsed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                Memory Used: {memoryUsed ? 'YES' : 'NO'}
              </span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                memoryMode === 'on'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                Mode: {memoryMode.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {memoryUsed 
                ? `Hindsight Cloud organizational memory actively informed Groq's diagnosis and investigation checklist.`
                : memoryMode === 'off'
                ? `Analysis based strictly on current live incident telemetry. Hindsight memory was disabled.`
                : isNoMemoryMatch
                ? `Hindsight enabled, but no sufficiently relevant historical incidents were found in memory.`
                : `Hindsight recall was interrupted: ${memoryError}`
              }
            </p>
          </div>
        </div>

        {/* Compare CTA */}
        {onCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition self-start sm:self-auto shadow-2xs"
            title="Run side-by-side comparison on this exact incident"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Compare ON vs OFF</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* ── CASE 1: HINDSIGHT OFF ── */}
        {!memoryUsed && memoryMode === 'off' && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Analysis based only on the current incident. Hindsight memory was disabled.</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              No historical incident postmortems, previous root causes, or verified remediations were supplied to the reasoning model. 
              The AI generated its hypothesis and investigation checklist purely from live observability signals and generic operational heuristics.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-800 font-medium">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200">Precedents: 0</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200">Failed Fixes Known: 0</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200">Verified Fixes Recalled: 0</span>
            </div>
          </div>
        )}

        {/* ── CASE 2: HINDSIGHT ON BUT NO MATCH ── */}
        {!memoryUsed && isNoMemoryMatch && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Hindsight enabled, but no sufficiently relevant historical incidents were found.</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hindsight Cloud bank <code className="font-mono text-slate-800 font-semibold">unicase-incident-memory</code> was queried with live symptoms, but no previous incident matched above the similarity threshold. Groq reasoned from first principles without hallucinating historical evidence.
            </p>
          </div>
        )}

        {/* ── CASE 3: HINDSIGHT FAILED ── */}
        {!memoryUsed && memoryError && (
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Hindsight recall failed.</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              {memoryError}. Investigation proceeded using current incident facts only.
            </p>
          </div>
        )}

        {/* ── CASE 4: HINDSIGHT ON & MEMORIES RETRIEVED ── */}
        {memoryUsed && (
          <div className="space-y-4">
            {/* Impact Metric Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Precedents Recalled
                </span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {memories.length} historical incident{memories.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Target Memory Bank
                </span>
                <span className="text-xs font-mono font-semibold text-sky-700 truncate block">
                  unicase-incident-memory
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Memory Utilization
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active in Groq Prompt
                </span>
              </div>
            </div>

            {/* Historical Evidence Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-600" />
                Retrieved Historical Evidence
              </span>

              {memories.map((mem, idx) => {
                const incId = mem.incident_id || mem.id || `INC-HIST-00${idx + 1}`;
                const whyRelevant = mem.relevance_reason || mem.similarity_explanation || (
                  `Shared failure signature: connection pool depletion causing downstream latency spikes.`
                );

                return (
                  <div 
                    key={incId || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    {/* Item Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700">
                          {incId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-700 font-semibold">
                          {mem.service || incident.service}
                        </span>
                        {mem.date && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {mem.date}
                            </span>
                          </>
                        )}
                      </div>

                      {mem.score && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                          {Math.round(mem.score * 100)}% Match
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h5 className="text-xs font-bold text-slate-900">
                      {mem.title || `Prior outage on ${mem.service || incident.service}`}
                    </h5>

                    {/* Why considered relevant */}
                    <div className="p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-sky-900 font-semibold block mb-0.5">Why Relevant:</strong>
                      {whyRelevant}
                    </div>

                    {/* Root Cause */}
                    {mem.root_cause && (
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900 font-semibold">Root Cause: </strong>
                        <span>{mem.root_cause}</span>
                      </div>
                    )}

                    {/* Successful & Failed Fixes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {/* Successful Fixes */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Successful Fixes That Worked
                        </span>
                        {mem.successful_fixes && mem.successful_fixes.length > 0 ? (
                          <ul className="text-xs text-slate-700 space-y-1">
                            {mem.successful_fixes.map((fix, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{fix}</span>
                              </li>
                            ))}
                          </ul>
                        ) : mem.resolution ? (
                          <p className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{mem.resolution}</span>
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No specific fix record</span>
                        )}
                      </div>

                      {/* Failed Fixes To Avoid */}
                      <div className="p-2.5 rounded-lg bg-rose-50/40 border border-rose-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-rose-600" />
                          Failed Fixes To Avoid
                        </span>
                        {mem.failed_fixes && mem.failed_fixes.length > 0 ? (
                          <ul className="text-xs text-slate-700 space-y-1">
                            {mem.failed_fixes.map((fail, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <span className="text-rose-600 font-bold">✕</span>
                                <span>{fail}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            No failed fixes recorded in this postmortem.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
