import React from 'react';
import { 
  Dna, 
  Server, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  GitCommit, 
  Activity, 
  History, 
  ShieldCheck, 
  Tag,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function IncidentDNACard({ dna, incidentId, title }) {
  if (!dna) return null;

  const metricsList = Object.entries(dna.metrics || {});

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-sky-50/80 via-indigo-50/50 to-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-600 text-white shadow-sm ring-4 ring-sky-100">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Incident DNA Fingerprint</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Genetic Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unique behavioral characteristics & telemetry signature
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="font-mono text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded border border-slate-200">
            {incidentId}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
            {dna.severity || 'P1 - Critical'}
          </span>
        </div>
      </div>

      {/* Main DNA Grid */}
      <div className="p-6 space-y-5">
        {/* Core Attributes Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Service */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Server className="h-3.5 w-3.5 text-sky-600" />
              Affected Service
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 truncate">
              {dna.service}
            </div>
          </div>

          {/* Error Pattern */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Error Pattern
            </div>
            <div className="font-semibold text-xs text-amber-900 truncate" title={dna.error_pattern}>
              {dna.error_pattern}
            </div>
          </div>

          {/* Root Cause Category */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Root Cause Category
            </div>
            <div className="font-semibold text-xs text-indigo-900 truncate" title={dna.root_cause_category}>
              {dna.root_cause_category}
            </div>
          </div>
        </div>

        {/* Detailed Sections: Symptoms & Dependencies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Observable Symptoms */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-rose-500" /> Symptoms & Signatures
            </span>
            <ul className="space-y-1.5 text-slate-700">
              {dna.symptoms?.map((sym, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{sym}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Dependencies */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-600" /> Upstream / Downstream Dependencies
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dna.dependencies?.map((dep, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium flex items-center gap-1"
                >
                  <Cpu className="h-3 w-3 text-purple-500" />
                  {dep}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Infrastructure Runtime:</span>
              <span className="font-medium text-slate-800">{dna.infrastructure || 'Not available'}</span>
            </div>
          </div>
        </div>

        {/* Changes & Measured Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Recent Changes */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <GitCommit className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Recent Changes / Deployments
              </span>
              <p className="text-xs text-slate-800 font-medium">
                {dna.recent_changes || 'Not available'}
              </p>
            </div>
          </div>

          {/* Historical Similarity */}
          <div className="p-3.5 rounded-lg bg-sky-50/50 border border-sky-200 flex items-start gap-2.5">
            <History className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-0.5">
                Historical Memory Match
              </span>
              <p className="text-xs font-semibold text-slate-900">
                {dna.historical_similarity}
              </p>
            </div>
          </div>
        </div>

        {/* Real Metrics Section (Strictly displaying 'Not available' when absent) */}
        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-600" /> Extracted Telemetry Metrics
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Only verified facts — no invented data
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {metricsList.map(([metricName, val], idx) => {
              const isAvailable = val && val !== 'Not available';
              return (
                <div key={idx} className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block truncate">{metricName}</span>
                  <span className={`text-xs font-mono font-bold block mt-0.5 ${
                    isAvailable ? 'text-slate-900' : 'text-slate-400 font-normal italic'
                  }`}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
