import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown, Radio, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { environment, setEnvironment, addToast } = useApp();
  const [showEnv, setShowEnv] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [q, setQ] = useState('');

  const notes = [
    { id:1, title:'P1: Payment API 503 Spike', time:'10m ago', type:'critical', to:'/incidents' },
    { id:2, title:'AI Root Cause Hypothesized (94%)', time:'8m ago', type:'ai', to:'/investigation' },
    { id:3, title:'P2: Auth Service JWKS Invalidation', time:'24m ago', type:'high', to:'/incidents' },
  ];

  const onSearch = e => { e.preventDefault(); if (!q.trim()) return; navigate(`/incidents?search=${encodeURIComponent(q)}`); setQ(''); };
  const onEnv = env => { setEnvironment(env); setShowEnv(false); addToast({title:'Environment',message:`Switched to ${env}`,type:'info'}); };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button onClick={onOpenSidebar} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"><Menu className="w-5 h-5" /></button>
        <form onSubmit={onSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search incidents, services..." className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={()=>setShowEnv(!showEnv)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 transition-colors">
            <Radio className="w-3.5 h-3.5 text-emerald-500" /><span className="hidden sm:inline font-mono">{environment}</span><ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showEnv && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Environment</div>
              {APP_CONFIG.environments.map(env => (
                <button key={env} onClick={()=>onEnv(env)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                  <span className="font-mono">{env}</span>{environment===env&&<Check className="w-3.5 h-3.5 text-violet-500"/>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={()=>setShowNotif(!showNotif)} className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Incident Alerts</span>
                <span className="text-[10px] text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {notes.map(n => (
                  <div key={n.id} onClick={()=>{setShowNotif(false);navigate(n.to);}} className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors">
                    <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type==='critical'?'bg-red-500':n.type==='ai'?'bg-violet-500':'bg-orange-400'}`}/>
                    <div><p className="text-xs font-medium text-slate-700">{n.title}</p><span className="text-[10px] text-slate-400">{n.time}</span></div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button onClick={()=>{setShowNotif(false);navigate('/incidents');}} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 w-full justify-center font-medium">View all incidents<ExternalLink className="w-3 h-3"/></button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">AC</div>
          <div className="hidden md:block"><p className="text-xs font-semibold text-slate-700">Alex Chen</p><p className="text-[10px] text-emerald-500 font-medium">● Primary SRE</p></div>
        </div>
      </div>
    </header>
  );
}
