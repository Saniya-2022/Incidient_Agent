import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Plus, AlertTriangle, Clock, ChevronRight, Tag } from 'lucide-react';
import { getRunbooks } from '../services/api';
import { useApp } from '../context/AppContext';

const RISK_COLOR = { Critical:'bg-red-50 text-red-700 border-red-200', High:'bg-orange-50 text-orange-700 border-orange-200', Medium:'bg-amber-50 text-amber-700 border-amber-200', Low:'bg-emerald-50 text-emerald-700 border-emerald-200' };

function RunbookModal({ runbook, onClose }) {
  if (!runbook) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{runbook.id}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${RISK_COLOR[runbook.risk] || RISK_COLOR.Medium}`}>{runbook.risk} Risk</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{runbook.title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{runbook.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 ml-4 shrink-0 transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4"/>Estimated time: <strong className="text-slate-700">{runbook.estimatedTime}</strong>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Steps</h3>
            <div className="space-y-2">
              {runbook.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
          {runbook.verification && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Verification</p>
              <p className="text-sm text-emerald-700">{runbook.verification}</p>
            </div>
          )}
          {runbook.tags && runbook.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {runbook.tags.map(t => <span key={t} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RunbooksPage() {
  const { addToast } = useApp();
  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const categories = ['All','Database','Authentication','Payment','Streaming','Infrastructure'];

  useEffect(() => {
    setLoading(true);
    getRunbooks({ search: searchQuery, category: categoryFilter })
      .then(d => setRunbooks(d))
      .catch(e => { console.error(e); setRunbooks([]); })
      .finally(() => setLoading(false));
  }, [searchQuery, categoryFilter]);

  const RISK_BADGE = { Critical:'text-red-600 bg-red-50 border-red-200', High:'text-orange-600 bg-orange-50 border-orange-200', Medium:'text-amber-600 bg-amber-50 border-amber-200', Low:'text-emerald-600 bg-emerald-50 border-emerald-200' };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-violet-600"/></div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">Runbooks</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold">Verified SOP Catalog</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Standard operating procedures and automated remediation workflows for production outages.</p>
        </div>
        <button onClick={()=>addToast({title:'Runbook Creator',message:'Custom runbooks require a runbook management backend. Currently showing the built-in SOP catalog.',type:'info'})}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4"/>New SOP Runbook
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-3">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search runbook title, ID, or description..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"/>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button key={cat} onClick={()=>setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${categoryFilter===cat?'bg-violet-600 text-white shadow-sm':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm text-slate-500">Loading runbooks...</p>
        </div>
      ) : runbooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No runbooks found</h3>
          <p className="text-sm text-slate-400 mb-4">Try searching with different keywords or switch categories.</p>
          <button onClick={()=>{setSearchQuery('');setCategoryFilter('All');}} className="text-sm text-violet-600 hover:text-violet-700 font-semibold">View All Runbooks</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {runbooks.map(rb => (
            <div key={rb.id} onClick={()=>setSelected(rb)}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 cursor-pointer hover:border-violet-300 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{rb.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${RISK_BADGE[rb.risk]||RISK_BADGE.Medium}`}>{rb.risk} Risk</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{rb.title}</h3>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1"/>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{rb.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3"/>{rb.estimatedTime}</div>
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">{rb.category}</span>
              </div>
              {rb.tags && rb.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                  {rb.tags.slice(0,3).map(t=><span key={t} className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-mono">{t}</span>)}
                  {rb.tags.length > 3 && <span className="text-[10px] text-slate-400">+{rb.tags.length-3}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <RunbookModal runbook={selected} onClose={()=>setSelected(null)}/>
    </div>
  );
}
