import React, { useState } from 'react';
import { 
  GitFork, 
  AlertCircle, 
  History, 
  BrainCircuit, 
  CheckCircle2, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ExternalLink,
  Layers,
  ArrowDown
} from 'lucide-react';

const NODE_CONFIGS = {
  'CURRENT FACT': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
    icon: AlertCircle,
    label: 'CURRENT FACT',
    border: 'border-blue-200',
    bg: 'bg-blue-50/20'
  },
  'HISTORICAL EVIDENCE': {
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-600',
    icon: History,
    label: 'HISTORICAL EVIDENCE',
    border: 'border-sky-200',
    bg: 'bg-sky-50/20'
  },
  'AI HYPOTHESIS': {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: BrainCircuit,
    label: 'AI HYPOTHESIS (UNVERIFIED)',
    border: 'border-amber-200',
    bg: 'bg-amber-50/20'
  },
  'ENGINEER VERIFIED': {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
    icon: CheckCircle2,
    label: 'CONFIRMED ROOT CAUSE',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/20'
  },
  'MITIGATION': {
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    dot: 'bg-teal-600',
    icon: Wrench,
    label: 'MITIGATION APPLIED',
    border: 'border-teal-200',
    bg: 'bg-teal-50/20'
  }
};

const SOURCE_BADGES = {
  CURRENT: 'bg-blue-100 text-blue-800',
  MEMORY: 'bg-sky-100 text-sky-800',
  AI: 'bg-purple-100 text-purple-800',
  ENGINEER: 'bg-emerald-100 text-emerald-800'
};

export default function EvidenceChainView({ evidenceChain, isResolved }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  if (!evidenceChain || evidenceChain.length === 0) return null;

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Causal Evidence Chain</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Reasoning Path
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Traceable flow from reported symptoms through historical memory to root cause hypothesis
            </p>
          </div>
        </div>

        {/* Status banner */}
        <div className="text-xs">
          {isResolved ? (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Verified & Remediated
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-amber-600" />
              Hypothesis Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Vertical Connected Chain */}
      <div className="p-6">
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {evidenceChain.map((node, index) => {
            const config = NODE_CONFIGS[node.type] || NODE_CONFIGS['CURRENT FACT'];
            const Icon = config.icon;
            const isExpanded = expandedNodes[node.id] || index === evidenceChain.length - 1;
            const sourceBadge = SOURCE_BADGES[node.source_type] || 'bg-slate-100 text-slate-700';

            return (
              <div key={node.id || index} className="relative group">
                {/* Step Connector Dot */}
                <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white ring-2 ring-slate-100 ${config.dot} flex items-center justify-center transition shadow-xs`} />

                {/* Evidence Node Card */}
                <div className={`p-4 rounded-xl border ${config.border} ${config.bg} bg-white shadow-xs transition hover:shadow-sm space-y-2.5`}>
                  {/* Top Node Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${config.badge} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Step {node.step_number || index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${sourceBadge}`}>
                        [{node.source_type}] {node.source_label}
                      </span>
                      <button
                        onClick={() => toggleExpand(node.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 transition"
                        title="Toggle Evidence Details"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {node.title}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans mt-0.5">
                      {node.description}
                    </p>
                  </div>

                  {/* Expandable Evidence Details */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 animate-fade-in bg-white/60 p-2.5 rounded-lg border border-slate-200/60">
                      <div>
                        <span className="font-bold uppercase text-[9px] text-slate-400 block">Origin Source</span>
                        <span className="font-medium text-slate-800">{node.source_label}</span>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[9px] text-slate-400 block">Epistemic Confidence</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${node.confidence === 'Verified' ? 'bg-emerald-500' : node.confidence === 'Observed' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                          {node.confidence}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
