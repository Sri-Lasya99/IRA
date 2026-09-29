import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  FastForward, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  BrainCircuit, 
  Layers, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function IncidentReplayPlayer({ timeline = [], memoryImpact, isResolved = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showComparison, setShowComparison] = useState(true);
  const timerRef = useRef(null);

  const events = timeline && timeline.length > 0 ? timeline : [
    { time_offset: "00:00", phase: "Detection", title: "Deployment Event", description: "Service release or configuration update detected", actor: "system", badge: "Trigger" },
    { time_offset: "00:03", phase: "Detection", title: "Telemetry Anomaly", description: "P99 latency began drifting upwards", actor: "system", badge: "Telemetry" },
    { time_offset: "00:07", phase: "Detection", title: "Error Rate Spike", description: "5xx error threshold breached", actor: "system", badge: "Alert" },
    { time_offset: "00:10", phase: "Triage", title: "Incident Pager Fired", description: "On-call engineer paged for active triage", actor: "system", badge: "Intake" },
    { time_offset: "00:12", phase: "Intelligence", title: "Hindsight RECALL Started", description: "Querying memory bank 'unicase-incident-memory'", actor: "hindsight", badge: "RECALL" },
    { time_offset: "00:15", phase: "Intelligence", title: "Historical Memory Matched", description: "Found matching precedent postmortem with verified root cause", actor: "hindsight", badge: "Memory" },
    { time_offset: "00:18", phase: "Reasoning", title: "Groq Reasoning Completed", description: "Investigation plan & safe CLI diagnostic queries generated", actor: "groq", badge: "Groq AI" },
    { time_offset: "00:25", phase: "Investigation", title: "Engineer Diagnostic Triage", description: "SRE inspecting live state with targeted diagnostic plan", actor: "engineer", badge: "Engineer" }
  ];

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1800 / speed);
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, events.length]);

  const handlePlayPause = () => {
    if (currentIndex >= events.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentEvent = events[currentIndex] || events[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in space-y-0">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Incident Replay</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Timeline Player
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Step-by-step reconstruction of the incident lifecycle from trigger to mitigation
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Restart Replay"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{currentIndex >= events.length - 1 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-mono font-bold hover:bg-slate-50 transition"
            title="Toggle Replay Speed"
          >
            {speed}x
          </button>
        </div>
      </div>

      {/* KPI Timing Metrics Ribbon */}
      <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Total Duration
          </span>
          <div className="text-sm font-bold font-mono text-slate-900">
            {isResolved ? '50 mins' : '~25 mins active'}
          </div>
          <span className="text-[10px] text-slate-500">From alert to resolution</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Time to Detection
          </span>
          <div className="text-sm font-bold font-mono text-blue-700">
            10 mins
          </div>
          <span className="text-[10px] text-slate-500">Anomalous latency spike</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Hindsight RECALL Speed
          </span>
          <div className="text-sm font-bold font-mono text-emerald-700">
            34 ms
          </div>
          <span className="text-[10px] text-slate-500">Vector + BM25 match</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Triage Phase
          </span>
          <div className="text-sm font-bold font-mono text-indigo-700 truncate">
            {currentEvent.phase}
          </div>
          <span className="text-[10px] text-slate-500">Step {currentIndex + 1} of {events.length}</span>
        </div>
      </div>

      {/* Progress Bar / Scrubber */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>{currentEvent.time_offset}</span>
          <span className="font-sans font-semibold text-slate-700">{currentEvent.title}</span>
          <span>{events[events.length - 1].time_offset}</span>
        </div>

        {/* Step dots & line */}
        <div className="relative flex items-center">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Clickable step chips */}
        <div className="flex justify-between mt-2 overflow-x-auto gap-1">
          {events.map((ev, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                idx === currentIndex
                  ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-200'
                  : idx < currentIndex
                  ? 'bg-sky-50 text-sky-800'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {ev.time_offset}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Spotlight Card */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-white border border-sky-200 text-sky-600 font-mono font-bold text-xs shrink-0">
            {currentEvent.time_offset}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-sky-100 text-sky-800">
                {currentEvent.phase}
              </span>
              <span className="text-[10px] font-mono text-slate-400">Actor: {currentEvent.actor}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              {currentEvent.title}
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 font-sans leading-relaxed">
              {currentEvent.description}
            </p>
          </div>
        </div>
      </div>

      {/* Memory Impact Comparison Section */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Memory Impact: With vs Without Hindsight
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
            Demo Simulation / Conceptual Comparison
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* WITHOUT MEMORY */}
          <div className="p-4 rounded-lg bg-white border border-rose-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block pb-1 border-b border-rose-100">
              Without Historical Memory (Cold Triage)
            </span>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              {(memoryImpact?.without_memory_steps || [
                "1. Alert arrives with high latency & 504 errors",
                "2. Cold investigation from zero organizational context",
                "3. Manual trial-and-error log parsing across distributed pods",
                "4. Unaware of past Redis pool exhaustion outage 3 weeks prior",
                "5. Re-discovering known bug takes 45–60 minutes of debugging",
                "6. Delayed resolution & prolonged user impact"
              ]).map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-mono mt-0.5">✕</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WITH MEMORY */}
          <div className="p-4 rounded-lg bg-white border border-emerald-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block pb-1 border-b border-emerald-100">
              With Hindsight Memory (Persistent Recall)
            </span>
            <ul className="space-y-1.5 text-slate-700 text-[11px]">
              {(memoryImpact?.with_memory_steps || [
                "1. Alert arrives with high latency & 504 errors",
                "2. Hindsight Cloud instantly RECALLS matching postmortem INC-HIST-001",
                "3. Precedent highlights exact past root cause: Redis pool capped at 20",
                "4. Groq generates targeted read-only diagnostic commands immediately",
                "5. SRE confirms pool utilization in 3 minutes and applies tested fix",
                "6. Hindsight RETAIN persists resolution — closing the learning loop"
              ]).map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-mono font-bold mt-0.5">✓</span>
                  <span className="font-medium text-slate-800">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center pt-1">
          {memoryImpact?.memory_role_summary || "Hindsight Cloud provides immediate institutional memory, transforming past outages into immediate diagnostic shortcuts."}
        </p>
      </div>
    </div>
  );
}
