import React, { useEffect, useState } from 'react';
import { X, Database, RefreshCw, Calendar, Layers, Tag } from 'lucide-react';
import { getHindsightMemories } from '../services/api';

export default function MemoryBankViewer({ isOpen, onClose, bankId = "unicase-incident-memory" }) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMemories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHindsightMemories();
      setData(res || { items: [], total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load memory bank contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Hindsight Cloud Memory Bank</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 font-semibold">
                  {bankId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Persistent cross-session memories on <code className="text-slate-700">api.hindsight.vectorize.io</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchMemories}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Refresh memories"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Total Stored Memory Units: <strong className="text-slate-900 font-semibold">{data.total || data.items?.length || 0}</strong></span>
            <span className="text-sky-700 font-medium">Hindsight Cloud API</span>
          </div>

          {loading && (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-sky-600" />
              <span>Fetching live memories from Hindsight Cloud...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              Error fetching memories: {error}
            </div>
          )}

          {!loading && !error && (data.items?.length === 0 || !data.items) && (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Database className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-800 font-semibold mb-1">Bank is currently empty (0 memories)</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                Load historical incidents or resolve an active incident to store memories in Hindsight Cloud.
              </p>
            </div>
          )}

          {!loading && !error && data.items?.map((item, idx) => (
            <div key={item.id || idx} className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-sky-700 font-bold">
                  {item.id || `Unit-${idx + 1}`}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  {item.timestamp && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" /> {new Date(item.timestamp).toLocaleString()}
                    </span>
                  )}
                  {item.type && (
                    <span className="uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>

              <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed">
                {item.content || item.text || item.fact || JSON.stringify(item, null, 2)}
              </pre>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
