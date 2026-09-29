import React, { useState } from 'react';
import { X, CheckCircle2, Database, Sparkles } from 'lucide-react';

export default function ResolutionModal({ incident, onClose, onResolve, isResolving }) {
  if (!incident) return null;

  const [formData, setFormData] = useState({
    root_cause: '',
    resolution: '',
    outcome: '',
    recent_deployment: incident.recent_deployment || '',
    resolved_by: 'oncall-engineer',
    duration_minutes: 30
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onResolve(incident.id, formData);
  };

  const handleAutoFill = () => {
    const topMem = incident?.recalled_memories?.[0];
    const detected = incident?.investigation_report?.detected_pattern;
    setFormData({
      ...formData,
      root_cause: topMem?.root_cause || detected || "Redis connection pool exhaustion in session cache layer.",
      resolution: topMem?.resolution || "Increased connection pool size to 150 and configured 2500ms socket timeouts.",
      outcome: topMem?.outcome || "Operational latency normalized to baseline 65ms and error rate dropped to 0.00%."
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resolve Incident & RETAIN Memory
              </h3>
              <p className="text-xs text-slate-500">
                Experience will be retained in Hindsight Cloud bank: <code className="text-sky-700 font-mono font-medium">unicase-incident-memory</code>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Incident reference banner */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900">{incident.title}</span>
              <span className="text-slate-500 font-mono block mt-0.5">{incident.id} • {incident.service} • {incident.severity}</span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-semibold text-[11px] transition shadow-2xs"
              title="Auto-fill with top recalled historical precedent"
            >
              <Sparkles className="h-3 w-3 text-sky-600" />
              <span>Auto-fill top hypothesis</span>
            </button>
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmed Root Cause
            </label>
            <textarea
              required
              rows={3}
              value={formData.root_cause}
              onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
              placeholder="e.g. Redis connection pool exhaustion."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution
            </label>
            <textarea
              required
              rows={3}
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              placeholder="e.g. Increased Redis connection pool size and restarted affected pods."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Outcome
            </label>
            <input
              type="text"
              required
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              placeholder="e.g. API latency returned to normal."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition placeholder:text-slate-400"
            />
          </div>

          {/* Recent Deployment (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recent Deployment / Change (Optional)
            </label>
            <input
              type="text"
              value={formData.recent_deployment}
              onChange={(e) => setFormData({ ...formData, recent_deployment: e.target.value })}
              placeholder="e.g. v2.4.1 release or config change"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition placeholder:text-slate-400"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResolving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isResolving ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Retaining in Hindsight Cloud...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Commit Resolution & RETAIN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
