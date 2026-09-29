import React from 'react';
import { X, Settings as SettingsIcon, Database, Cpu, Shield, Server } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, health }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                System & Intelligence Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Managed persistent memory and inference parameters
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Hindsight Cloud */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-sky-600" /> Hindsight Cloud Persistent Memory
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {health?.hindsight_cloud?.connected ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank ID</span>
                <span className="font-mono text-slate-800 font-semibold">{health?.hindsight_cloud?.bank_id || 'unicase-incident-memory'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Base URL</span>
                <span className="font-mono text-slate-800 truncate block">api.hindsight.vectorize.io</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Memory Count</span>
                <span className="font-mono text-slate-800 font-semibold">{health?.hindsight_cloud?.total_memories ?? 0} units</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Multi-Strategy Retrieval</span>
                <span className="text-slate-800">Vector + BM25 + Graph + Temporal</span>
              </div>
            </div>
          </div>

          {/* Groq Inference Engine */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-600" /> Groq Inference Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {health?.groq_api?.connected ? 'Online' : 'Degraded'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Model</span>
                <span className="font-mono text-slate-800 font-semibold">{health?.groq_api?.model || 'qwen/qwen3.8-27b'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperature</span>
                <span className="font-mono text-slate-800">0.1 (Deterministic)</span>
              </div>
            </div>
          </div>

          {/* Decision Support Boundary */}
          <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800 block mb-0.5">Enterprise Safety Policy:</strong>
              Incident Response Agent is configured strictly for diagnostic investigation and decision-support. No automated production repairs or mutations are permitted.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
