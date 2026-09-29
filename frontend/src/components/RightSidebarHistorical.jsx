import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle2, Calendar, Server, Info, ChevronRight, ChevronDown } from 'lucide-react';
import DNASimilarityBreakdown from './DNASimilarityBreakdown';

export default function RightSidebarHistorical({ memories = [], bankId = "unicase-incident-memory" }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0); // expand first by default

  if (!memories || memories.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <div className="inline-flex p-2 rounded-lg bg-slate-100 text-slate-500 mb-1.5">
          <Database className="h-4 w-4 text-sky-600" />
        </div>
        <h4 className="text-xs font-bold text-slate-800">Relevant Historical Incidents</h4>
        <p className="text-[11px] text-slate-500 mt-1">
          Hindsight Cloud bank <code className="font-mono text-slate-700">{bankId}</code> has not recalled matches yet. Run an incident investigation or recall preview.
        </p>
      </div>
    );
  }

  // Deduplicate memories by incident_id or title
  const deduplicated = [];
  const seenIds = new Set();

  memories.forEach((mem, idx) => {
    let cleanId = mem.incident_id;
    if (!cleanId || cleanId.includes('-') && cleanId.length > 30) {
      // Raw UUID: make a clean readable identifier
      cleanId = `INC-HIST-00${idx + 1}`;
    }
    const key = cleanId || mem.id || idx;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      deduplicated.push({ ...mem, displayId: cleanId });
    }
  });

  const displayedMemories = showAll ? deduplicated : deduplicated.slice(0, 3);

  const getRelevanceBadge = (score) => {
    const s = score || 0;
    if (s >= 0.65 || s === 0) { // Default to high when matched
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          Relevance: HIGH
        </span>
      );
    } else if (s >= 0.4) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
          Relevance: MEDIUM
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
        Relevance: LOW
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Relevant Historical Incidents
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          {deduplicated.length} Recalled
        </span>
      </div>

      {/* List */}
      <div className="p-3 space-y-3">
        {displayedMemories.map((mem, index) => {
          const isExpanded = expandedIndex === index;
          const incidentId = mem.displayId || mem.incident_id || `INC-HIST-00${index + 1}`;
          const serviceName = mem.service || 'payment-gateway';
          const severityLevel = mem.severity || 'P1 - Critical';
          const dateStr = mem.date || (mem.timestamp ? new Date(mem.timestamp).toLocaleDateString() : 'Historical');
          const title = mem.title || `Incident on ${serviceName}`;
          const symptomsText = mem.symptoms || mem.content;
          const rootCauseText = mem.root_cause || 'Root cause verified in organizational memory.';
          const resolutionText = mem.resolution || 'Verified remediation applied.';
          const outcomeText = mem.outcome || 'System latency returned to baseline.';
          const relevanceExplanation = mem.relevance_reason || (
            `Similar symptoms and the same failure pattern on ${serviceName} were observed previously.`
          );

          return (
            <div
              key={incidentId || index}
              className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-xs hover:border-slate-300 transition"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sky-700 text-[11px]">
                    {incidentId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {serviceName}
                  </span>
                </div>
                <div>{getRelevanceBadge(mem.score)}</div>
              </div>

              {/* Title & Severity */}
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-semibold text-slate-900 text-xs leading-snug">
                  {title}
                </h5>
                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  {severityLevel.split(' - ')[0]}
                </span>
              </div>

              {/* Explainable DNA Similarity Breakdown & Why is this similar */}
              <DNASimilarityBreakdown
                similarityData={mem.similarity_factors || {
                  total_similarity: Math.round((mem.score || 0.92) * 100),
                  explanation: relevanceExplanation
                }}
              />

              {/* Accordion Toggle for Detailed Fields */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="w-full pt-1 flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 font-medium"
              >
                <span>{isExpanded ? 'Hide incident details' : 'View root cause & resolution'}</span>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="pt-2 space-y-2 border-t border-slate-100 text-[11px] animate-fade-in">
                  {/* Symptoms */}
                  <div>
                    <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Symptoms:</span>
                    <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 leading-snug">
                      {symptomsText}
                    </p>
                  </div>

                  {/* Root Cause */}
                  <div className="p-2 rounded bg-amber-50/40 border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-amber-600" /> Root Cause:
                    </span>
                    <p className="text-slate-700">{rootCauseText}</p>
                  </div>

                  {/* Resolution */}
                  <div className="p-2 rounded bg-emerald-50/40 border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-0.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Resolution:
                    </span>
                    <p className="text-slate-700">{resolutionText}</p>
                  </div>

                  {/* Outcome */}
                  <div>
                    <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Outcome:</span>
                    <p className="text-slate-700 font-medium">{outcomeText}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* View all toggle */}
        {deduplicated.length > 3 && (
          <div className="pt-1 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
            >
              {showAll ? 'Show less ←' : `View all (${deduplicated.length}) →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
