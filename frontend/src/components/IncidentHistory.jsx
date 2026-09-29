import React from 'react';
import { History, CheckCircle2, ChevronRight, Database } from 'lucide-react';

export default function IncidentHistory({ incidents, activeIncidentId, onSelectIncident }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
        <div className="inline-flex p-2.5 rounded-lg bg-slate-100 text-slate-500 mb-2">
          <History className="h-4 w-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-700">No Active Incidents in Session</h4>
        <p className="text-[11px] text-slate-500 mt-1">
          Submit an incident to initiate investigation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Current Session ({incidents.length})
          </h3>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {incidents.map((inc) => {
          const isSelected = inc.id === activeIncidentId;
          const isResolved = inc.status === 'resolved';

          return (
            <button
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`w-full p-3.5 text-left transition flex items-start justify-between gap-3 ${
                isSelected 
                  ? 'bg-sky-50/50 border-l-4 border-sky-600' 
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    {inc.id}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    isResolved 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 truncate">
                  {inc.title}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-mono text-slate-700 font-medium">{inc.service}</span>
                  <span>•</span>
                  <span>{inc.severity.split(' - ')[0]}</span>
                  {inc.retained_in_hindsight && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Database className="h-2.5 w-2.5" /> Retained
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className={`h-4 w-4 shrink-0 transition mt-1 ${
                isSelected ? 'text-sky-600' : 'text-slate-400'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
