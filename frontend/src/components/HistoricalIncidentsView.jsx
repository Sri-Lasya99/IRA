import React, { useState, useEffect } from 'react';
import { History, Calendar, Server, AlertCircle, CheckCircle2, Search, ArrowRight, ShieldCheck, Layers, RefreshCw } from 'lucide-react';
import { getHindsightMemories } from '../services/api';
import AgentLearningCurveCard from './AgentLearningCurveCard';

export default function HistoricalIncidentsView({ incidents = [], onSelectIncident, onNewIncident, onViewKnowledgeGraph }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchedMemories, setFetchedMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMemories = async () => {
      setIsLoading(true);
      try {
        const res = await getHindsightMemories();
        if (res?.items && Array.isArray(res.items)) {
          setFetchedMemories(res.items);
        }
      } catch (err) {
        console.warn("Could not fetch memory items for catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMemories();
  }, []);

  // Map fetched memories to catalog objects
  const memoryCatalog = fetchedMemories.map(m => ({
    id: m.id,
    title: m.title || `Incident ${m.id}`,
    service: m.service || 'microservice',
    severity: m.severity || 'P2 - High',
    date: m.date_display || (m.timestamp ? m.timestamp.slice(0, 10) : '2026'),
    root_cause: m.root_cause || 'Root cause triage documented in persistent organizational memory.',
    resolution: m.resolution || 'Verified remediation applied and retained.',
    outcome: m.outcome || 'Operational baseline restored.',
    symptoms: m.symptoms || (m.content ? m.content.slice(0, 180) + '...' : 'Incident telemetry recorded.'),
    tags: m.tags || []
  }));

  // Combine with session incidents
  const sessionCatalog = incidents.map(inc => ({
    id: inc.id,
    title: inc.title,
    service: inc.service,
    severity: inc.severity,
    date: inc.created_at ? inc.created_at.slice(0, 10) : '2026-09-27',
    root_cause: inc.resolution?.root_cause || 'Investigation and root cause triage documented in incident record.',
    resolution: inc.resolution?.resolution || 'Remediation verified by engineering team.',
    outcome: inc.resolution?.outcome || 'Operational baseline restored.',
    symptoms: inc.symptoms,
    tags: inc.tags || []
  }));

  const existingIds = new Set(sessionCatalog.map(s => s.id));
  const fullCatalog = [
    ...sessionCatalog,
    ...memoryCatalog.filter(m => !existingIds.has(m.id))
  ];

  // Default baseline if neither loaded yet
  const catalog = fullCatalog.length > 0 ? fullCatalog : [
    {
      id: "INC-HIST-001",
      title: "Payment Service Initial Redis Connection Exhaustion",
      service: "payment-gateway",
      severity: "P2 - High",
      date: "Jan 2025",
      root_cause: "Default connection pool ceiling of 10 was insufficient for concurrent checkout volume.",
      resolution: "Increased max Redis pool size from 10 to 30.",
      outcome: "Checkout latency restored to 60ms baseline.",
      symptoms: "Checkout latency increased from 60ms to 2400ms. JedisConnectionException: Could not get a resource from pool.",
      tags: ["payment-gateway", "redis", "connection-pool", "latency"]
    }
  ];

  const filtered = catalog.filter(inc => {
    const q = searchTerm.toLowerCase();
    return (
      (inc.title || '').toLowerCase().includes(q) ||
      (inc.service || '').toLowerCase().includes(q) ||
      (inc.id || '').toLowerCase().includes(q) ||
      (inc.root_cause || '').toLowerCase().includes(q) ||
      (inc.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 max-w-[1600px] w-full mx-auto animate-fade-in pb-12">
      {/* Agent Learning Curve Section */}
      <AgentLearningCurveCard />

      {/* Postmortems Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">
            Historical Incident Postmortems
          </h2>
          <span className="text-xs text-slate-400">
            ({filtered.length} of {catalog.length} showing)
          </span>
        </div>
        {isLoading && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing memories...
          </span>
        )}
      </div>

      {/* Postmortems List */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-700">
                  {inc.id}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {inc.date}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Server className="h-3 w-3 text-slate-400" />
                  {inc.service}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  inc.severity?.includes('P1')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {inc.severity}
                </span>
                {inc.tags && inc.tags.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {inc.tags.slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              {inc.title}
            </h3>

            {/* Symptoms */}
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Symptoms:</span>
              {inc.symptoms}
            </div>

            {/* Root Cause & Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100">
                <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Confirmed Root Cause:
                </span>
                <p className="text-slate-700">{inc.root_cause}</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Resolution Applied:
                </span>
                <p className="text-slate-700">{inc.resolution}</p>
              </div>
            </div>

            {/* Outcome */}
            <div className="text-xs text-slate-700 flex items-center justify-between pt-1">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] mr-2">Outcome:</span>
                <span className="font-medium text-slate-900">{inc.outcome}</span>
              </div>
              {onSelectIncident && (
                <button
                  onClick={() => onSelectIncident(inc)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition"
                >
                  <span>Load in workspace</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
