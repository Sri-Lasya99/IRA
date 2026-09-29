import React, { useEffect } from 'react';
import { X, Activity, History, Lightbulb } from 'lucide-react';
import CurrentSessionCard from './CurrentSessionCard';
import RightSidebarHistorical from './RightSidebarHistorical';
import InvestigationSummaryCard from './InvestigationSummaryCard';

export default function ActivityHistoryDrawer({
  isOpen,
  onClose,
  currentIncident,
  sessionIncidents = [],
  onSelectIncident,
  onNewIncident,
  memories = [],
  bankId = "unicase-incident-memory"
}) {
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col h-full z-10 animate-fade-in">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Activity & Historical Intelligence
                </h3>
                <p className="text-xs text-slate-500">
                  Session timeline, recalled precedents, and summary
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Close panel (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body with Stacked Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* 1. Investigation Summary Card (shown when incident has report) */}
            {currentIncident?.investigation_report && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>Investigation Summary</span>
                </div>
                <InvestigationSummaryCard incident={currentIncident} />
              </div>
            )}

            {/* 2. Activity Session Card */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-sky-600" />
                <span>Session Activity</span>
              </div>
              <CurrentSessionCard
                currentIncident={currentIncident}
                sessionIncidents={sessionIncidents}
                onSelectIncident={(inc) => {
                  onSelectIncident(inc);
                  onClose();
                }}
                onNewIncident={() => {
                  onNewIncident();
                  onClose();
                }}
              />
            </div>

            {/* 3. Relevant Historical Incidents */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-indigo-600" />
                <span>Relevant Historical Incidents</span>
              </div>
              <RightSidebarHistorical
                memories={memories}
                bankId={bankId}
              />
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-700">ESC</kbd> to close</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
