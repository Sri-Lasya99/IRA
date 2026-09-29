import React from 'react';
import { 
  Sparkles, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Layers, 
  Brain, 
  Share2,
  GitCommit
} from 'lucide-react';

export default function OrganizationalLearningCard({ incident, learningSummary }) {
  if (!incident || incident.status !== 'resolved') return null;

  const resolution = incident.resolution || {};
  const learning = learningSummary || incident.learning_summary || {
    memory_id: incident.id,
    incident_pattern: `${incident.service} • ${incident.title}`,
    verified_root_cause: resolution.root_cause || "Root cause verified by engineering team.",
    successful_mitigation: resolution.resolution || "Remediation verified and deployed.",
    resolution_duration: `${resolution.duration_minutes || 30} minutes`,
    reusable_knowledge: `When ${incident.service} experiences similar failure signatures, verify ${resolution.root_cause || 'the verified failure mode'}. Remediation: ${resolution.resolution || 'apply standard patch'}.`,
    bank_evolution: {
      before_count: 3,
      after_count: 4,
      before_ids: ["INC-HIST-001", "INC-HIST-002", "INC-HIST-003"],
      new_memory_id: incident.id,
      bank_id: "unicase-incident-memory"
    }
  };

  const evolution = learning.bank_evolution || {
    before_count: 3,
    after_count: 4,
    before_ids: ["INC-HIST-001", "INC-HIST-002", "INC-HIST-003"],
    new_memory_id: incident.id,
    bank_id: "unicase-incident-memory"
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden animate-fade-in space-y-0">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                What did the organization learn?
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Closed-Loop Memory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Persistent memory retained in Hindsight Cloud bank: <code className="font-mono text-emerald-800 font-semibold">{evolution.bank_id || "unicase-incident-memory"}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
            NEW MEMORY UNIT: {incident.id}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Core Learning Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Incident Pattern & Root Cause */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Incident Pattern
              </span>
              <div className="font-semibold text-slate-900">
                {learning.incident_pattern}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                Verified Root Cause
              </span>
              <p className="text-slate-800 font-sans leading-relaxed">
                {learning.verified_root_cause}
              </p>
            </div>
          </div>

          {/* Mitigation & Duration */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Applied Remediation
              </span>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {learning.resolution_duration}
              </span>
            </div>
            <p className="text-slate-800 font-sans leading-relaxed">
              {learning.successful_mitigation}
            </p>

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
              <span className="font-medium text-slate-900">Verified By: </span>
              {resolution.resolved_by || 'oncall-engineer'}
            </div>
          </div>
        </div>

        {/* Reusable Institutional Knowledge Callout */}
        <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
            <BookOpen className="h-4 w-4 text-emerald-700" />
            <span>Reusable Knowledge Unit:</span>
          </div>
          <p className="text-slate-800 leading-relaxed font-sans text-xs pl-5">
            "{learning.reusable_knowledge}"
          </p>
        </div>

        {/* Closed-Loop Brain Banner */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 flex items-center gap-2.5 text-xs text-sky-900 font-medium">
          <Brain className="h-4 w-4 text-sky-600 shrink-0" />
          <span>
            This knowledge will be available to future incidents through <strong>Hindsight RECALL</strong>.
          </span>
        </div>

        {/* Incident Memory Evolution Tree */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Layers className="h-4 w-4 text-sky-600" />
              <span>Incident Memory Evolution</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Bank Capacity: {evolution.before_count} ➔ {evolution.after_count} memories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Before RETAIN */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
              <div className="text-[10px] font-sans font-bold uppercase text-slate-400 mb-2">
                Before RETAIN ({evolution.before_count} memories)
              </div>
              <div className="space-y-1 pl-1 text-[11px]">
                <div>Memory Bank ({evolution.bank_id})</div>
                {(evolution.before_ids || ["INC-HIST-001", "INC-HIST-002", "INC-HIST-003"]).map((id, idx, arr) => (
                  <div key={idx} className="text-slate-500">
                    {idx === arr.length - 1 ? '└── ' : '├── '}{id}
                  </div>
                ))}
              </div>
            </div>

            {/* After RETAIN */}
            <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-300 text-slate-700 relative overflow-hidden">
              <div className="text-[10px] font-sans font-bold uppercase text-emerald-800 mb-2 flex items-center justify-between">
                <span>After RETAIN ({evolution.after_count} memories)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold animate-pulse">
                  +1 NEW
                </span>
              </div>
              <div className="space-y-1 pl-1 text-[11px]">
                <div>Memory Bank ({evolution.bank_id})</div>
                {(evolution.before_ids || ["INC-HIST-001", "INC-HIST-002", "INC-HIST-003"]).map((id, idx) => (
                  <div key={idx} className="text-slate-500">
                    ├── {id}
                  </div>
                ))}
                <div className="font-bold text-emerald-800 bg-emerald-100/80 px-1 rounded flex items-center justify-between">
                  <span>└── {evolution.new_memory_id || incident.id}</span>
                  <span className="text-[10px] font-sans font-semibold">← NEW KNOWLEDGE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
