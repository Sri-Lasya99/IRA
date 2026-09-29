import React from 'react';
import { Activity, Clock, Plus, ChevronRight } from 'lucide-react';

export default function CurrentSessionCard({ 
  currentIncident, 
  sessionIncidents = [], 
  onSelectIncident,
  onNewIncident 
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case 'investigating':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            Investigating
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Awaiting
          </span>
        );
    }
  };

  const getSeverityBadge = (severity) => {
    const isP1 = severity?.includes('P1');
    const isP2 = severity?.includes('P2');
    return (
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
        isP1
          ? 'bg-rose-50 text-rose-700 border border-rose-200'
          : isP2
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}>
        {severity?.split(' - ')[0] || 'P2'}
      </span>
    );
  };

  // Compile list of incidents to display in the session
  const incidentList = sessionIncidents.length > 0 
    ? sessionIncidents 
    : currentIncident ? [currentIncident] : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Session
          </h3>
        </div>
        <button
          onClick={onNewIncident}
          className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition"
          title="Draft a new incident"
        >
          <Plus className="h-3 w-3" />
          <span>New</span>
        </button>
      </div>

      {/* Compact Cards List */}
      <div className="p-3 space-y-2">
        {incidentList.length > 0 ? (
          incidentList.map((inc) => {
            const isSelected = currentIncident?.id === inc.id;
            return (
              <button
                key={inc.id}
                type="button"
                onClick={() => onSelectIncident && onSelectIncident(inc)}
                className={`w-full text-left p-2.5 rounded-lg border transition space-y-1 block group ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-200 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                {/* ID & Status */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-sky-700 group-hover:text-sky-800">
                    {inc.id}
                  </span>
                  <div>{getStatusBadge(inc.status)}</div>
                </div>

                {/* Service & Severity */}
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono text-slate-700 font-medium truncate">
                    {inc.service}
                  </span>
                  <div>{getSeverityBadge(inc.severity)}</div>
                </div>

                {/* Title */}
                <p className="text-[11px] text-slate-600 truncate font-sans">
                  {inc.title}
                </p>
              </button>
            );
          })
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">
            <span>No incidents in session. Click "+ Report New" to begin.</span>
          </div>
        )}
      </div>
    </div>
  );
}
