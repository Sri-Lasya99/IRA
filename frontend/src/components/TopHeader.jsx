import React from 'react';
import { Activity, PanelRightClose, Database, ShieldAlert, Check } from 'lucide-react';

export default function TopHeader({ 
  title, 
  onToggleActivityDrawer, 
  isActivityDrawerOpen = false,
  badgeCount = 0,
  hindsightEnabled = true,
  onToggleHindsight
}) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Context / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-sm font-bold text-slate-900 truncate">
          {title || "Incident Workspace"}
        </h2>
      </div>

      {/* Right: Hindsight ON/OFF Toggle & Evidence Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Hindsight ON / OFF Segmented Switch */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Database className="h-3.5 w-3.5 text-sky-600" />
            <span className="hidden md:inline text-[11px]">Hindsight:</span>
          </div>
          <div className="inline-flex items-center p-0.5 rounded-md bg-slate-200/80 border border-slate-300/70">
            <button
              type="button"
              onClick={() => onToggleHindsight && onToggleHindsight(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                !hindsightEnabled
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Disable historical recall: Groq reasons from current incident only"
            >
              OFF
            </button>
            <button
              type="button"
              onClick={() => onToggleHindsight && onToggleHindsight(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                hindsightEnabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Enable Hindsight Cloud: recall historical precedents for root cause triage"
            >
              ON
            </button>
          </div>
        </div>

        {/* Evidence Button (formerly Activity & History) */}
        <button
          type="button"
          onClick={onToggleActivityDrawer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition shadow-2xs ${
            isActivityDrawerOpen
              ? 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-100'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          title="Show Evidence, Activity Session, and Historical Incidents"
        >
          {isActivityDrawerOpen ? (
            <PanelRightClose className="h-3.5 w-3.5 text-sky-600" />
          ) : (
            <Activity className="h-3.5 w-3.5 text-sky-600" />
          )}
          <span>Evidence</span>
          {badgeCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-700">
              {badgeCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
