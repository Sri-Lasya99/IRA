import React from 'react';
import { 
  Clock, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Layers
} from 'lucide-react';

export default function TemporalReasoningCard({ 
  temporal, 
  memoryUsed = true, 
  memoryMode = "on" 
}) {
  // Case 1: Memory is disabled (OFF)
  if (!memoryUsed || memoryMode === 'off') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Resolution History & Temporal Reasoning</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Temporal reasoning is disabled because Hindsight memory was turned <strong className="font-mono text-slate-700">OFF</strong>. 
          The agent reasons purely from current telemetry without comparing historical resolution timelines.
        </p>
      </div>
    );
  }

  // Case 2: No temporal object or no entries
  if (!temporal || (!temporal.resolution_history?.length && !temporal.temporal_insight)) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Resolution History</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Insufficient historical precedents in organizational memory to establish a chronological resolution timeline.
        </p>
      </div>
    );
  }

  const {
    resolution_history = [],
    temporal_insight,
    recommended_approach,
    alternative_historical_approach,
    why,
    has_sufficient_history,
    status_notice
  } = temporal;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in space-y-4 p-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resolution History
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Evolving Experience
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chronological progression of previous fixes and how their effectiveness evolved over time
            </p>
          </div>
        </div>

        {has_sufficient_history ? (
          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
            {resolution_history.length} Chronological Precedents
          </span>
        ) : (
          <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 self-start sm:self-auto">
            Single Incident History
          </span>
        )}
      </div>

      {/* ── SECTION 1: 🕒 CHRONOLOGICAL RESOLUTION HISTORY ── */}
      {resolution_history.length > 0 && (
        <div className="space-y-3">
          <div className="relative pl-4 sm:pl-6 border-l-2 border-indigo-100 space-y-4 my-2">
            {resolution_history.map((entry, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[21px] sm:-left-[29px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-xs" />

                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 hover:bg-white hover:border-indigo-200 transition space-y-2">
                  {/* Incident Header: Date & ID */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {entry.date_display || "Date unrecorded"}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {entry.incident_id}
                      </span>
                    </div>

                    {entry.service && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {entry.service}
                      </span>
                    )}
                  </div>

                  {entry.title && (
                    <div className="text-xs font-semibold text-slate-800">
                      {entry.title}
                    </div>
                  )}

                  {/* Fixes List with ✓ Worked and ✕ Failed */}
                  {entry.fixes && entry.fixes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {entry.fixes.map((fix, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs">
                          {fix.status === 'worked' && (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>✓ Worked</span>
                            </span>
                          )}
                          {fix.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 shrink-0">
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>✕ Failed</span>
                            </span>
                          )}
                          {fix.status === 'unrecorded' && (
                            <span className="inline-flex items-center gap-1 font-mono text-slate-500 shrink-0">
                              <span>• Fix:</span>
                            </span>
                          )}
                          <span className={`leading-snug ${
                            fix.status === 'failed' 
                              ? 'text-slate-600 line-through decoration-rose-300' 
                              : 'text-slate-800 font-medium'
                          }`}>
                            {fix.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* System/Deployment changes that explain difference */}
                  {entry.system_changes && (
                    <div className="text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded border border-slate-100 flex items-center gap-1.5 mt-1">
                      <GitBranch className="h-3 w-3 text-slate-400 shrink-0" />
                      <span><strong>Deployment / Change Context:</strong> {entry.system_changes}</span>
                    </div>
                  )}

                  {/* Outcome */}
                  {entry.outcome && (
                    <div className="text-[11px] text-slate-600 pt-0.5">
                      <span className="text-slate-400 font-semibold">Outcome: </span>
                      <span>{entry.outcome}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice for single incident */}
      {status_notice && (
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <HelpCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{status_notice}</span>
        </div>
      )}

      {/* ── SECTION 2: 🧠 TEMPORAL INSIGHT ── */}
      {temporal_insight && (
        <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Temporal Insight
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-normal">
            {temporal_insight}
          </p>
        </div>
      )}

      {/* ── SECTION 3: STRATEGIC RECOMMENDATIONS & ALTERNATIVES ── */}
      {(recommended_approach || alternative_historical_approach || why) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          
          {/* Recommended Approach */}
          {recommended_approach && (
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Recommended Approach (Stronger Recent Evidence)
              </span>
              <p className="text-xs font-semibold text-slate-900 leading-snug">
                {recommended_approach}
              </p>
            </div>
          )}

          {/* Alternative Historical Approach */}
          <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-600" />
              Alternative Historical Approach (Proven Baseline)
            </span>
            <p className="text-xs font-semibold text-slate-900 leading-snug">
              {alternative_historical_approach || "Older baseline fixes remain available if secondary factors are ruled out."}
            </p>
          </div>

          {/* Why Section */}
          {why && (
            <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Why: Evidence-Based Analysis
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {why}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
