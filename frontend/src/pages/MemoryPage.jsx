import React, { useEffect, useState, useCallback } from 'react';
import { Brain, Search, AlertCircle, RefreshCw, Clock, Server, Lightbulb, Database } from 'lucide-react';
import { getMemoryItems, searchMemoryItems, checkMemoryHealth } from '../services/api';
import SeverityBadge from '../components/common/SeverityBadge';

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1) return 'just now';
  if (d < 60) return d + 'm ago';
  const h = Math.floor(d / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

export default function MemoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const load = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const data = q ? await searchMemoryItems(q) : await getMemoryItems();
      setItems(data);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Unknown error';
      // Distinguish connectivity error from empty results
      if (e?.code === 'ERR_NETWORK' || e?.response?.status >= 500) {
        setError('Memory service unavailable. Hindsight may not be running.');
      } else {
        setError('Unable to load memory: ' + msg);
      }
      setItems([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => { load(''); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) { load(''); return; }
    setSearching(true);
    load(search.trim());
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center"><Brain className="w-5 h-5 text-violet-600"/></div>
          <h1 className="text-2xl font-bold text-slate-800">Hindsight Memory</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Historical incident knowledge that improves every future AI analysis</p>
      </div>

      {/* Concept cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Database,   color: 'bg-blue-50 text-blue-600',    title: 'Historical Incidents',   desc: 'Every analyzed incident is stored as structured knowledge for future retrieval.' },
          { icon: Search,     color: 'bg-violet-50 text-violet-600', title: 'Semantic Retrieval',     desc: 'When a new incident arrives, similar past incidents are retrieved using vector search.' },
          { icon: Lightbulb,  color: 'bg-amber-50 text-amber-600',   title: 'Continuous Learning',   desc: 'Each analysis enriches the memory bank so the AI improves with every incident.' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}><c.icon className="w-4 h-4"/></div>
            <div><p className="text-sm font-semibold text-slate-800">{c.title}</p><p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.desc}</p></div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search memory (e.g. database connection, payment 503)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"/>
          </div>
          <button type="submit" disabled={searching} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors disabled:opacity-60">
            {searching ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'Search'}
          </button>
          {search && <button type="button" onClick={()=>{setSearch('');load('');}} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Clear</button>}
        </form>
        <p className="text-xs text-slate-400 mt-2">Semantic search powered by Hindsight vector memory</p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm text-slate-500">Loading memory...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3"/>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Memory service unavailable</h3>
          <p className="text-xs text-red-500 mb-4">{error}</p>
          <button onClick={()=>load(search)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/>Retry
          </button>
          <p className="text-xs text-slate-400 mt-3">Memory is populated automatically when incidents are analyzed via the AI Investigation flow.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center">
          <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">{search ? 'No matching memory found' : 'No memory items yet'}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {search
              ? 'Try a different search query, or clear the search to see all memory.'
              : 'Memory is populated automatically as incidents are analyzed and resolved. Analyze an incident to create the first memory entry.'}
          </p>
          {search && <button onClick={()=>{setSearch('');load('');}} className="mt-3 text-sm text-violet-600 font-medium hover:text-violet-700">Clear search</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{items.length} knowledge record{items.length !== 1 ? 's' : ''}</span>
            <button onClick={()=>load(search)} className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium">
              <RefreshCw className="w-3 h-3"/>Refresh
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="px-5 py-4 hover:bg-violet-50/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{item.text || item.title || 'Memory record'}</p>
                    {item.context && <p className="text-xs text-slate-500 mb-1">Context: {item.context}</p>}
                    {item.type && (
                      <span className="text-[10px] font-mono text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">{item.type}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3"/>
                    {timeAgo(item.occurred_start || item.mentioned_at || item.created_at) || 'Historical'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
