import React from 'react';
import { ArrowRight, Check, AlertCircle, History, BrainCircuit, ListOrdered, ShieldCheck, Database } from 'lucide-react';

export const INVESTIGATION_STEPS = [
  { num: 1, id: 'incident', label: '1 Incident', subtitle: 'Live Facts', icon: AlertCircle },
  { num: 2, id: 'recall', label: '2 Recall', subtitle: 'Hindsight Memory', icon: History },
  { num: 3, id: 'reasoning', label: '3 Reasoning', subtitle: 'Groq AI', icon: BrainCircuit },
  { num: 4, id: 'investigate', label: '4 Investigate', subtitle: 'Action Checklist', icon: ListOrdered },
  { num: 5, id: 'verify', label: '5 Verify', subtitle: 'Human Verification', icon: ShieldCheck },
  { num: 6, id: 'retain', label: '6 Retain', subtitle: 'Close Learning Loop', icon: Database },
];

export default function WorkflowSteps({ currentStep = 1, onSelectStep, maxStep = 6 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between text-xs overflow-x-auto gap-1">
        {INVESTIGATION_STEPS.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const isClickable = Boolean(onSelectStep);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onSelectStep && onSelectStep(step.num)}
                className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg transition text-left ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 ring-2 ring-sky-100 font-bold shadow-2xs'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    : 'text-slate-400 hover:text-slate-600 border border-transparent'
                }`}
                title={`Jump to Step ${step.num}: ${step.label}`}
              >
                {/* Step badge */}
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3 stroke-[2.5]" /> : step.num}
                </span>

                <div className="flex flex-col leading-tight">
                  <span className={`text-[11px] ${isActive ? 'font-bold text-sky-900' : isCompleted ? 'font-semibold text-slate-800' : 'font-medium'}`}>
                    {step.label}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:inline">
                    {step.subtitle}
                  </span>
                </div>
              </button>

              {idx < INVESTIGATION_STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mx-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
