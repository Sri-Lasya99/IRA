import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Layers, CheckCircle2, Info } from 'lucide-react';

export default function DNASimilarityBreakdown({ similarityData, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!similarityData) return null;

  const total = similarityData.total_similarity || 90;
  const factors = similarityData.factors || [
    { name: "Service Match", percentage: 30, max: 30, detail: "Matching service domain" },
    { name: "Error Pattern Match", percentage: 25, max: 25, detail: "Matching error codes" },
    { name: "Dependency Match", percentage: 20, max: 20, detail: "Shared infrastructure" },
    { name: "Symptom Match", percentage: 10, max: 15, detail: "Correlated symptoms" },
    { name: "Stack Trace Match", percentage: 7, max: 10, detail: "Matching stack trace signatures" }
  ];
  const explanation = similarityData.explanation || "This incident is similar based on matching symptoms, shared dependencies, and failure patterns.";

  return (
    <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-3 space-y-2.5 text-xs">
      {/* Top Header & Total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-sky-600" />
          <span className="font-semibold text-slate-800">Overall Similarity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
            {total}% Match
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-white hover:bg-sky-50 px-2 py-0.5 rounded border border-sky-200 transition"
          >
            <span>Why is this similar?</span>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Explanation & Similarity Factors */}
      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-sky-200/60 animate-fade-in">
          {/* Plain Language Explanation */}
          <div className="p-2.5 rounded-md bg-white border border-sky-200/80 text-slate-700 leading-relaxed text-[11px] font-sans flex items-start gap-2">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Similarity Reason:</strong>
              {explanation}
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-2 bg-white/70 p-2.5 rounded-md border border-sky-100">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
              <span>Similarity Factors (Explainable Breakdown)</span>
              <span>Weight</span>
            </div>

            {factors.map((factor, idx) => {
              const pct = factor.percentage || 0;
              const max = factor.max || 30;
              const fillPct = Math.min(Math.round((pct / max) * 100), 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-800">{factor.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      +{pct}% <span className="text-[10px] text-slate-400 font-normal">/ {max}%</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  {factor.detail && (
                    <span className="text-[10px] text-slate-500 block truncate">
                      {factor.detail}
                    </span>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>Total Factor Confidence</span>
              <span className="font-mono font-bold text-sky-700">{total}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
