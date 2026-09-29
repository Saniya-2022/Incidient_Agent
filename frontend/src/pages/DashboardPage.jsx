import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Sparkles, CheckCircle2, Search, Plus, ArrowRight, Brain, Zap } from 'lucide-react';
import { getIncidents } from '../services/api';
import { useApp } from '../context/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import CreateIncidentModal from '../components/incident/CreateIncidentModal';

function KPI({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4"/></div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now()-new Date(iso))/60000);
  if (d<1) return 'just now'; if (d<60) return `${d}m ago`;
  const h=Math.floor(d/60); if (h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    getIncidents({}).then(d=>{ setIncidents(d||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const active   = incidents.filter(i=>!['resolved','closed'].includes(i.status)).length;
  const critical = incidents.filter(i=>i.severity==='critical').length;
  const investigating = incidents.filter(i=>i.status==='investigating'||i.status==='in_progress').length;
  const resolved = incidents.filter(i=>i.status==='resolved').length;
  const recent   = [...incidents].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5);

  const handleCreated = inc => { setIncidents(p=>[inc,...p]); setShowCreate(false); addToast({title:'Incident Reported',message:`"${inc.title}" created.`,type:'success'}); };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-powered incident response — real-time overview</p>
        </div>
        <button onClick={()=>setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4"/>Report Incident
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Incidents" value={loading?'—':active}   icon={AlertTriangle}  color="bg-blue-50 text-blue-600"    sub="Requiring attention"/>
        <KPI label="Critical"         value={loading?'—':critical} icon={Zap}            color="bg-red-50 text-red-600"      sub="Highest priority"/>
        <KPI label="Investigating"    value={loading?'—':investigating} icon={Search}     color="bg-violet-50 text-violet-600" sub="AI analyzing"/>
        <KPI label="Resolved"         value={loading?'—':resolved} icon={CheckCircle2}   color="bg-emerald-50 text-emerald-600" sub="Completed"/>
      </div>

      {/* Capability cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: AlertTriangle, color: 'text-violet-600 bg-violet-50', title: 'Incident Ingestion', desc: 'Report incidents with title, service, severity, error messages and log evidence.', action: 'Report Incident', to: null, fn: ()=>setShowCreate(true) },
          { icon: Brain,         color: 'text-indigo-600 bg-indigo-50', title: 'Hindsight Memory',  desc: 'Historical incident knowledge is retrieved automatically to enrich every new analysis.', action: 'View Memory', to: '/memory' },
          { icon: Sparkles,      color: 'text-violet-600 bg-violet-50', title: 'AI Root Cause',     desc: 'Groq LLM generates root cause, resolution steps, and prevention recommendations.', action: 'View Incidents', to: '/incidents' },
        ].map(card => (
          <div key={card.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}><card.icon className="w-5 h-5"/></div>
            <div>
              <h3 className="font-semibold text-slate-800">{card.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
            </div>
            <button onClick={card.fn||(()=>navigate(card.to))} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              {card.action}<ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Incidents</h2>
          <button onClick={()=>navigate('/incidents')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">View all<ArrowRight className="w-3.5 h-3.5"/></button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading incidents...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No incidents yet. <button onClick={()=>setShowCreate(true)} className="text-violet-600 font-medium">Report one</button></div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(inc => (
              <div key={inc.id} onClick={()=>navigate(`/investigation/${inc.id}`)} className="px-5 py-3.5 flex items-center justify-between hover:bg-violet-50/30 cursor-pointer transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <SeverityBadge severity={inc.severity}/>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{inc.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{inc.service} · {timeAgo(inc.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={inc.status}/>
                  {inc.analysis?.root_cause && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-semibold border border-violet-100">AI ✓</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateIncidentModal isOpen={showCreate} onClose={()=>setShowCreate(false)} onCreated={handleCreated}/>
    </div>
  );
}

