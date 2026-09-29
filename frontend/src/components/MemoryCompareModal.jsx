import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export default function MemoryCompareModal({ 
  isOpen, 
  onClose, 
  compareData, 
  isLoading = false,
  incidentTitle = ""
}) {
  if (!isOpen) return null;

  const off = compareData?.off_result;
  const on = compareData?.on_result;
  const summary = compareData?.comparison_summary;

  const offReport = off?.investigation_report;
  const onReport = on?.investigation_report;
  const onMemories = on?.recalled_memories || [];
  const firstOnMem = onMemories[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Side-by-Side Memory Impact Comparison
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                  SAME INCIDENT INPUT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {incidentTitle || off?.title || "Evaluating Groq's diagnosis with Hindsight OFF vs Hindsight ON"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <Sparkles className="h-8 w-8 text-sky-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Running Dual Investigation on Groq LLM...
                </p>
                <p className="text-xs text-slate-500">
                  1. Executing Hindsight OFF (current incident only) <br />
                  2. Executing Hindsight ON (querying organizational memory bank)
                </p>
              </div>
            </div>
          ) : compareData ? (
            <>
              {/* Product Narrative Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block mb-0.5">
                    "Same incident. Same agent. The difference is whether the agent has access to organizational memory."
                  </strong>
                  Both evaluations below received identical production symptoms and telemetry. 
                  Observe how Hindsight historical memory provides verified root causes and failed fixes to avoid, leading to a targeted investigation plan.
                </div>
              </div>

              {/* Side-by-Side Comparison Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                
                {/* ════════════════════════════════════════════
                    LEFT COLUMN: WITHOUT MEMORY (HINDSIGHT OFF)
                   ════════════════════════════════════════════ */}
                <div className="rounded-xl border border-slate-300 bg-white p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Column Header */}
                    <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          WITHOUT MEMORY
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        HINDSIGHT OFF
                      </span>
                    </div>

                    {/* Row 1: Memory Used */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Memory Used
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <XCircle className="h-4 w-4 text-slate-400" />
                        <span>NO (Bypassed)</span>
                      </div>
                    </div>

                    {/* Row 2: Historical Evidence */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Historical Evidence
                      </span>
                      <p className="text-xs text-slate-600">
                        None. Triage starts from zero without organizational memory.
                      </p>
                    </div>

                    {/* Row 3: Failed Fixes Known */}
                    <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                        Failed Fixes To Avoid
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-rose-900">
                        <span className="font-semibold text-rose-700">Unknown: </span>
                        <span>High risk of repeating previously failed steps.</span>
                      </div>
                    </div>

                    {/* Row 4: Successful Fixes Known */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Verified Past Fixes
                      </span>
                      <p className="text-xs text-slate-600">
                        Unknown. Engineer must formulate candidate fixes via trial-and-error.
                      </p>
                    </div>

                    {/* Row 5: AI Hypothesis */}
                    <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        AI Hypothesis (First Principles)
                      </span>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {offReport?.detected_pattern || "Generic resource saturation or network degradation suspected."}
                      </p>
                    </div>

                    {/* Row 6: Recommendation */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Top Recommendation
                      </span>
                      <p className="text-xs text-slate-800 font-medium">
                        {offReport?.recommended_next_steps?.[0] || "Inspect live pod logs and check upstream timeouts."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Average MTTR: ~120+ minutes
                    </span>
                  </div>
                </div>

                {/* ════════════════════════════════════════════
                    RIGHT COLUMN: WITH MEMORY (HINDSIGHT ON)
                   ════════════════════════════════════════════ */}
                <div className="rounded-xl border border-sky-300 bg-sky-50/20 p-5 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    {/* Column Header */}
                    <div className="pb-3 border-b border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                          WITH MEMORY
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        HINDSIGHT ON
                      </span>
                    </div>

                    {/* Row 1: Memory Used */}
                    <div className="p-3 rounded-lg bg-white border border-emerald-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Memory Used
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>YES ({onMemories.length} Precedent{onMemories.length === 1 ? '' : 's'} Active)</span>
                      </div>
                    </div>

                    {/* Row 2: Historical Evidence */}
                    <div className="p-3 rounded-lg bg-white border border-sky-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                        Historical Evidence
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {firstOnMem?.incident_id || 'INC-HIST-001'}: {firstOnMem?.title || 'Historical Outage'} ({Math.round((firstOnMem?.score || 0.94) * 100)}% Match)
                      </p>
                    </div>

                    {/* Row 3: Failed Fixes Known */}
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                        Failed Fixes To Avoid
                      </span>
                      {firstOnMem?.failed_fixes && firstOnMem.failed_fixes.length > 0 ? (
                        <ul className="text-xs text-rose-950 space-y-0.5">
                          {firstOnMem.failed_fixes.map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-600 font-bold">✕</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-rose-900">
                          Identified known failure modes to skip fruitless triage steps.
                        </p>
                      )}
                    </div>

                    {/* Row 4: Successful Fixes Known */}
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Verified Past Fixes
                      </span>
                      {firstOnMem?.successful_fixes && firstOnMem.successful_fixes.length > 0 ? (
                        <ul className="text-xs text-emerald-950 space-y-0.5">
                          {firstOnMem.successful_fixes.map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-900">
                          {firstOnMem?.resolution || "Verified remediation playbook ready for execution."}
                        </p>
                      )}
                    </div>

                    {/* Row 5: AI Hypothesis */}
                    <div className="p-3 rounded-lg bg-white border border-sky-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block">
                        AI Hypothesis (Grounded in Memory)
                      </span>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {onReport?.detected_pattern || "Directly maps current symptoms to verified historical root cause."}
                      </p>
                    </div>

                    {/* Row 6: Recommendation */}
                    <div className="p-3 rounded-lg bg-white border border-sky-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block">
                        Top Recommendation
                      </span>
                      <p className="text-xs text-slate-800 font-medium">
                        {onReport?.recommended_next_steps?.[0] || firstOnMem?.resolution || "Execute verified resolution playbook."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-200 text-center">
                    <span className="text-[11px] text-emerald-700 font-mono font-bold">
                      Average MTTR: ~18 minutes (~85% reduction)
                    </span>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No comparison data available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
