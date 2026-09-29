import React from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  History, 
  Layers, 
  Settings as SettingsIcon, 
  Database, 
  Cpu
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  health, 
  onNewIncident, 
  onLoadHistory, 
  isLoadingHistory,
  onOpenSettings
}) {
  const hindsightOk = health?.hindsight_cloud?.connected;
  const groqOk = health?.groq_api?.connected;
  const memoryCount = health?.hindsight_cloud?.total_memories ?? 0;
  const bankId = health?.hindsight_cloud?.bank_id || 'unicase-incident-memory';

  const navItems = [
    { id: 'incident', label: 'New Incident', icon: PlusCircle, onClick: onNewIncident },
    { id: 'history', label: 'Historical Incidents', icon: History, onClick: () => onSelectTab('history') },
    { id: 'memories', label: 'Memory Bank', icon: Layers, onClick: () => onSelectTab('memories') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, onClick: onOpenSettings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none">
      {/* Top Brand */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
              Incident Response Agent
            </h1>
            
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) item.onClick();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom System Status */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          System Status
        </div>

        {/* Hindsight Cloud */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className={`h-2 w-2 rounded-full shrink-0 ${hindsightOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              Hindsight Cloud
            </span>
            <span className={`text-[11px] font-medium ${hindsightOk ? 'text-emerald-700' : 'text-rose-600'}`}>
              {hindsightOk ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="pl-3.5 text-[11px] text-slate-500">
            <div className="font-mono text-slate-700 truncate font-medium">{bankId}</div>
            <div className="text-[10px] text-slate-500">{memoryCount} memories</div>
          </div>
        </div>

        {/* Groq LLM */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className={`h-2 w-2 rounded-full shrink-0 ${groqOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            Groq LLM
          </span>
          <span className={`text-[11px] font-medium ${groqOk ? 'text-emerald-700' : 'text-rose-600'}`}>
            {groqOk ? 'Connected' : 'Degraded'}
          </span>
        </div>
      </div>
    </aside>
  );
}
