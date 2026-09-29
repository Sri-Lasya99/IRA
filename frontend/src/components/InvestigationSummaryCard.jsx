import React from 'react';
import { Lightbulb, CheckCircle2, History, Search } from 'lucide-react';

export default function InvestigationSummaryCard({ incident }) {
  const report = incident?.investigation_report;
  if (!report) return null;

  // Extract fields from report data
  const likelyCause = report.detected_pattern
    ? report.detected_pattern.split('.')[0]
    : "Pattern detected from telemetry and historical postmortems";

  const evidence = report.historical_evidence && report.historical_evidence.length > 0
    ? report.historical_evidence[0]
    : "Matching historical failure signature found in Hindsight Cloud";

  const firstRecalledMem = incident.recalled_memories && incident.recalled_memories.length > 0
    ? incident.recalled_memories[0]
    : null;

  const previousFix = firstRecalledMem?.resolution
    ? firstRecalledMem.resolution
    : (report.recommended_next_steps?.[0] || "Refer to previous resolution playbook in organizational memory");

  const recommendedInvestigation = report.investigation_plan && report.investigation_plan.length > 0
    ? report.investigation_plan[0].replace(/^\d+\.\s*/, '')
    : "Execute diagnostic plan outlined in investigation report";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Investigation Summary
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-3 text-xs">
        {/* Likely Cause */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Likely Cause
          </span>
          <p className="text-slate-800 font-semibold leading-snug">
            {likelyCause}
          </p>
        </div>

        {/* Evidence */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
            <History className="h-3 w-3 text-sky-600" /> Evidence
          </span>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            {evidence}
          </p>
        </div>

        {/* Previous Fix */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Previous Fix
          </span>
          <p className="text-slate-700 leading-relaxed text-[11px] bg-emerald-50/40 p-2 rounded border border-emerald-100">
            {previousFix}
          </p>
        </div>

        {/* Recommended Investigation */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
            <Search className="h-3 w-3 text-sky-600" /> Recommended Investigation
          </span>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            {recommendedInvestigation}
          </p>
        </div>
      </div>
    </div>
  );
}
