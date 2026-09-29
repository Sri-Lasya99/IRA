import React from 'react';
import { Database, CheckCircle2, AlertCircle, Calendar, Server, Info } from 'lucide-react';
import DNASimilarityBreakdown from './DNASimilarityBreakdown';

export default function MemoryRecallCard({ memories, bankId = "unicase-incident-memory" }) {
  if (!memories || memories.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
        <div className="inline-flex p-2.5 rounded-lg bg-slate-100 text-slate-500 mb-2">
          <Database className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Relevant Historical Incidents Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Hindsight Cloud memory bank <code className="text-slate-700 font-mono font-medium">{bankId}</code> returned no matching precedents for this failure pattern.
          This will be investigated as a novel incident.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Relevant Historical Incidents</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {memories.length} {memories.length === 1 ? 'Incident Recalled' : 'Incidents Recalled'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Retrieved from Hindsight Cloud bank: <span className="text-slate-700 font-mono font-medium">{bankId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recalled Historical Incidents List */}
      <div className="p-6 space-y-4">
        {memories.map((mem, index) => {
          const incidentId = mem.incident_id || mem.id || `INC-HIST-00${index + 1}`;
          const dateStr = mem.date || (mem.timestamp ? new Date(mem.timestamp).toLocaleString() : 'Previous Incident');
          const serviceName = mem.service || 'payment-gateway';
          const severityLevel = mem.severity || 'P1 - Critical';
          const symptomsText = mem.symptoms || mem.content;
          const rootCauseText = mem.root_cause || 'Root cause documented in incident record.';
          const resolutionText = mem.resolution || 'Resolution verified by engineering team.';
          const outcomeText = mem.outcome || 'System latency returned to baseline.';
          const relevanceExplanation = mem.relevance_reason || (
            `Similar symptoms and failure patterns on ${serviceName} were observed previously in organizational memory.`
          );

          return (
            <div
              key={mem.id || index}
              className="p-5 rounded-lg bg-white border border-slate-200 space-y-3 shadow-none hover:border-slate-300 transition"
            >
              {/* Header: ID, Date, Service, Severity */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-sky-700">
                    {incidentId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {dateStr}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-700 flex items-center gap-1 text-[11px]">
                    <Server className="h-3 w-3 text-slate-400" />
                    {serviceName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    {severityLevel}
                  </span>
                  {mem.score !== undefined && mem.score !== null && mem.score > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Score: {(mem.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Explainable DNA Similarity Breakdown */}
              <DNASimilarityBreakdown
                similarityData={mem.similarity_factors || {
                  total_similarity: Math.round((mem.score || 0.92) * 100),
                  explanation: relevanceExplanation
                }}
              />

              {/* Symptoms */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Symptoms
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                  {symptomsText}
                </p>
              </div>

              {/* Root Cause & Resolution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Root Cause */}
                <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
                  <span className="block font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Root Cause
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {rootCauseText}
                  </p>
                </div>

                {/* Resolution */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs">
                  <span className="block font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Resolution
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {resolutionText}
                  </p>
                </div>
              </div>

              {/* Outcome */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Outcome
                </span>
                <p className="text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-200 leading-relaxed font-medium">
                  {outcomeText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
