import React, { useState } from 'react';
import { AlertCircle, Search, Play, Sparkles, Terminal, Tag, Server, Database, GitCompare } from 'lucide-react';

const PRESETS = [
  {
    name: "Payment Gateway 504 Timeouts",
    title: "504 Gateway Timeouts on /v1/checkout API",
    service: "payment-gateway",
    severity: "P1 - Critical",
    environment: "production",
    symptoms: "Checkout latency increased from 65ms to 14000ms. 504 errors increased. Redis connection errors appeared in application pods.",
    logs: `2026-09-27T16:10:02Z [ERROR] payment-gateway: redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool
  at redis.clients.jedis.util.Pool.getResource(Pool.java:84)
  at com.unicase.payment.session.SessionCache.get(SessionCache.java:42)
2026-09-27T16:10:05Z [WARN] envoy.proxy: upstream request timeout to cluster 'payment-backend'`,
    tags: ["payment-gateway", "redis", "504", "timeout", "connection-pool"],
    recent_deployment: "v2.4.1 checkout coupon release deployed 2 hours prior"
  },
  {
    name: "Kafka Consumer Lag Storm",
    title: "Order Dispatch Consumer Lag exceeds 600k messages",
    service: "order-service",
    severity: "P2 - High",
    environment: "production",
    symptoms: "Order fulfillment delays of 45+ minutes. Consumer group 'order-dispatch-cg' is constantly rebalancing partitions every 90 seconds. CPU on broker nodes is stable.",
    logs: `2026-09-27T16:12:15Z [ERROR] order-service.consumer: org.apache.kafka.common.errors.RecordDeserializationException: Error deserializing key/value for partition orders-v2-4 at offset 1849202
Caused by: com.fasterxml.jackson.core.JsonParseException: Unexpected character ('<' (code 60)): expected a valid value
2026-09-27T16:12:45Z [WARN] kafka.coordinator.group: Member order-service-pod-3 in group order-dispatch-cg has failed, reason: max.poll.interval.ms exceeded`,
    tags: ["order-service", "kafka", "consumer-lag", "rebalance", "poison-pill"],
    recent_deployment: "Partner API format update"
  },
  {
    name: "PostgreSQL Deadlocks on Batch Billing",
    title: "Batch billing worker transactions failing with database deadlocks",
    service: "billing-service",
    severity: "P2 - High",
    environment: "production",
    symptoms: "End-of-month billing settlement pipeline stalled. Over 1,200 transaction aborts in 10 minutes. Database CPU at 95%.",
    logs: `2026-09-27T16:14:30Z [ERROR] billing.worker: asyncpg.exceptions.DeadlockDetectedError: deadlock detected
DETAIL: Process 18492 waits for ShareLock on transaction 829104; blocked by process 18501.
Process 18501 waits for ExclusiveLock on tuple (42, 18) of relation "user_invoices"; blocked by process 18492.
HINT: See server log for query details.`,
    tags: ["billing-service", "postgres", "database", "deadlock"],
    recent_deployment: "Billing batch worker cron update"
  }
];

export default function IncidentForm({ 
  onSubmit, 
  onPreviewRecall, 
  onCompare,
  isSubmitting, 
  isPreviewing,
  isComparing = false,
  hindsightEnabled: propHindsightEnabled,
  onToggleHindsight
}) {
  const [internalHindsightEnabled, setInternalHindsightEnabled] = useState(true);
  const hindsightEnabled = propHindsightEnabled !== undefined ? propHindsightEnabled : internalHindsightEnabled;
  const setHindsightEnabled = onToggleHindsight || setInternalHindsightEnabled;
  const [formData, setFormData] = useState({
    title: PRESETS[0].title,
    service: PRESETS[0].service,
    severity: PRESETS[0].severity,
    environment: PRESETS[0].environment,
    symptoms: PRESETS[0].symptoms,
    logs: PRESETS[0].logs,
    tagsInput: PRESETS[0].tags.join(", "),
    recent_deployment: PRESETS[0].recent_deployment || ""
  });

  const handlePresetSelect = (preset) => {
    setFormData({
      title: preset.title,
      service: preset.service,
      severity: preset.severity,
      environment: preset.environment,
      symptoms: preset.symptoms,
      logs: preset.logs,
      tagsInput: preset.tags.join(", "),
      recent_deployment: preset.recent_deployment || ""
    });
  };

  const getTagsArray = () => {
    return formData.tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: getTagsArray(),
      hindsight_enabled: hindsightEnabled,
      memory_mode: hindsightEnabled ? "on" : "off"
    });
  };

  const handleRecallPreview = (e) => {
    e.preventDefault();
    onPreviewRecall({
      query: `${formData.service} ${formData.title} ${formData.symptoms}`,
      service: formData.service,
      tags: getTagsArray()
    });
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (onCompare) {
      onCompare({
        ...formData,
        tags: getTagsArray()
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Report New Production Incident
          </h2>
        </div>

        {/* Templates Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Templates:
          </span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Incident Summary
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. 504 Gateway Timeouts on /v1/checkout API"
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition placeholder:text-slate-400"
          />
        </div>

        {/* Service, Severity, Environment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Server className="h-3 w-3 text-sky-600" /> Affected Service
            </label>
            <input
              type="text"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="e.g. payment-gateway"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition font-mono placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
            >
              <option value="P1 - Critical">P1 - Critical</option>
              <option value="P2 - High">P2 - High</option>
              <option value="P3 - Medium">P3 - Medium</option>
              <option value="P4 - Low">P4 - Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
            </select>
          </div>
        </div>

        {/* Symptoms & Metrics */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Symptoms & Metrics
          </label>
          <textarea
            required
            rows={3}
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="Describe observable symptoms, error rates, latency spikes, or failure patterns..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition placeholder:text-slate-400 leading-relaxed font-sans"
          />
        </div>

        {/* Diagnostic Output */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3 text-slate-500" /> Diagnostic Output (Logs, Stack Traces, Metrics)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            rows={4}
            value={formData.logs}
            onChange={(e) => setFormData({ ...formData, logs: e.target.value })}
            placeholder="Paste stack traces, error logs, or diagnostic terminal output..."
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition font-mono leading-relaxed placeholder:text-slate-400"
          />
        </div>

        {/* Diagnostic Tags & Recent Deployment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3 text-sky-600" /> Diagnostic Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              placeholder="payment-gateway, redis, 504, timeout, connection-pool"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition font-mono placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recent Deployment / Change (Optional)
            </label>
            <input
              type="text"
              value={formData.recent_deployment}
              onChange={(e) => setFormData({ ...formData, recent_deployment: e.target.value })}
              placeholder="e.g. v2.4.1 release or config change"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-4 flex items-center justify-end flex-wrap gap-2.5 border-t border-slate-200">
          {/* Preview Recall Button */}
            <button
              type="button"
              onClick={handleRecallPreview}
              disabled={isPreviewing || isSubmitting || !hindsightEnabled}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition disabled:opacity-40 shadow-xs"
              title={hindsightEnabled ? "Inspect raw historical recall results" : "Enable Hindsight Memory to preview recall"}
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>{isPreviewing ? 'Querying...' : 'Preview Recall'}</span>
            </button>

            {/* Compare Memory Impact Button */}
            {onCompare && (
              <button
                type="button"
                onClick={handleCompareClick}
                disabled={isSubmitting || isComparing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition disabled:opacity-50 shadow-xs"
                title="Run same incident through both Hindsight OFF and Hindsight ON side-by-side"
              >
                {isComparing ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 animate-spin text-sky-600" />
                    <span>Comparing...</span>
                  </>
                ) : (
                  <>
                    <GitCompare className="h-3.5 w-3.5 text-sky-600" />
                    <span>Compare Memory Impact</span>
                  </>
                )}
              </button>
            )}

            {/* Analyze Incident Button */}
            <button
              type="submit"
              disabled={isSubmitting || isComparing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>
                    {hindsightEnabled 
                      ? 'Analyzing (RECALL → Groq)...' 
                      : 'Analyzing (Current Only)...'}
                  </span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>
                    Analyze Incident {hindsightEnabled ? '(Memory ON)' : '(Memory OFF)'}
                  </span>
                </>
              )}
            </button>
        </div>
      </form>
    </div>
  );
}
