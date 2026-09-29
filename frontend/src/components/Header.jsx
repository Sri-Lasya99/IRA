import React from 'react';
import { Database, Cpu, ShieldCheck, Sparkles, Plus, RefreshCw, Layers } from 'lucide-react';

export default function Header({ health, onNewIncident, onOpenMemories, onLoadHistory, isLoadingHistory }) {
  const hindsightOk = health?.hindsight_cloud?.connected;
  const groqOk = health?.groq_api?.connected;
  const memoryCount = health?.hindsight_cloud?.total_memories;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Incident Response Agent</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Persistent incident intelligence powered by <span className="font-medium text-slate-700">Hindsight</span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hindsight Cloud Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className={`h-2 w-2 rounded-full ${hindsightOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="font-medium">Hindsight Cloud:</span>
            <span className="text-slate-600">{hindsightOk ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Memory Bank */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Database className="h-3 w-3 text-sky-600" />
            <span className="font-medium">Bank:</span>
            <span className="font-mono text-slate-800 text-[11px]">{health?.hindsight_cloud?.bank_id || 'unicase-incident-memory'}</span>
            {memoryCount !== undefined && (
              <span className="text-slate-500 font-sans text-[11px]">({memoryCount})</span>
            )}
          </div>

          {/* Groq Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className={`h-2 w-2 rounded-full ${groqOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="font-medium">Groq:</span>
            <span className="text-slate-600">{groqOk ? 'Connected' : 'Degraded'}</span>
          </div>

          {/* Memory Bank Inspection Button */}
          <button
            onClick={onOpenMemories}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition"
            title="Inspect persistent memories in Hindsight Cloud"
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>Memory Bank</span>
          </button>

          {/* Load Historical Incidents */}
          <button
            onClick={onLoadHistory}
            disabled={isLoadingHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition disabled:opacity-50"
            title="Load historical incident postmortems into Hindsight Cloud"
          >
            {isLoadingHistory ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-600" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            )}
            <span>Load Historical Incidents</span>
          </button>

          {/* New Incident Trigger */}
          <button
            onClick={onNewIncident}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
}
