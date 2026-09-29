import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Sparkles, Radio, Bell, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';

function Section({ icon: Icon, title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center"><Icon className="w-4 h-4 text-violet-600"/></div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h2>
        </div>
        {badge && <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{children}</label>;
}

function Hint({ children }) {
  return <p className="text-[11px] text-slate-400 mt-1">{children}</p>;
}

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all font-mono";
const readOnlyCls = "w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-500 font-mono cursor-not-allowed";

export default function SettingsPage() {
  const { environment, setEnvironment, addToast } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiProvider, setAiProvider] = useState('Groq');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-20b');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const integrations = [
    { id:'datadog',    name:'Datadog',    type:'Metrics & APM',                          status:'Connected', endpoint:'https://api.datadoghq.com/api/v1/events',    lastSync:'2 min ago'  },
    { id:'prometheus', name:'Prometheus', type:'Time-series Alerting',                   status:'Connected', endpoint:'http://prometheus-k8s.monitoring.svc:9090',  lastSync:'Just now'   },
    { id:'grafana',    name:'Grafana',    type:'Observability Dashboards',               status:'Connected', endpoint:'https://grafana.internal.infra/api',          lastSync:'15 min ago' },
    { id:'slack',      name:'Slack',      type:'Incident Channel Bot',                   status:'Connected', endpoint:'hooks.slack.com/services/T00/B00/X00',        lastSync:'1 min ago'  },
    { id:'pagerduty',  name:'PagerDuty',  type:'On-Call Rotation & Escalation',          status:'Connected', endpoint:'https://api.pagerduty.com/incidents',         lastSync:'3 min ago'  },
  ];

  const handleSaveGeneral  = e => { e.preventDefault(); addToast({ title:'Settings Saved',            message:'General preferences updated.',                              type:'success' }); };
  const handleSaveAi       = e => { e.preventDefault(); addToast({ title:'AI Config Updated',         message:`${aiProvider} · ${selectedModel} · ${confidenceThreshold}% threshold`, type:'ai'      }); };
  const handleTestInt      = n =>                         addToast({ title:'Integration Probe OK',     message:`Handshake with ${n} succeeded (HTTP 200).`,                 type:'success' });

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center"><SettingsIcon className="w-5 h-5 text-violet-600"/></div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold">Configuration</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 ml-11">Manage environment variables, AI reasoning parameters, and observability integrations.</p>
      </div>

      {/* Section 1: General */}
      <Section icon={Sliders} title="General Preferences">
        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>Active Environment</Label>
              <select value={environment} onChange={e=>setEnvironment(e.target.value)} className={inputCls}>
                {APP_CONFIG.environments.map(env=><option key={env} value={env}>{env}</option>)}
              </select>
              <Hint>Restricts telemetry ingestion to selected cluster.</Hint>
            </div>
            <div>
              <Label>Theme</Label>
              <input readOnly value="IR Agent Light" className={readOnlyCls}/>
              <Hint>Professional light theme for the AI Operations Platform.</Hint>
            </div>
            <div>
              <Label>Notifications</Label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-sm font-medium text-slate-700">{notificationsEnabled?'Enabled':'Muted'}</span>
                <button type="button" onClick={()=>setNotificationsEnabled(!notificationsEnabled)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${notificationsEnabled?'bg-violet-600':'bg-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled?'translate-x-5':'translate-x-0'}`}/>
                </button>
              </div>
              <Hint>Audio and push alerts for P1 critical events.</Hint>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors">Save Preferences</button>
          </div>
        </form>
      </Section>

      {/* Section 2: AI Configuration */}
      <Section icon={Sparkles} title="AI Configuration & Model Tuning" badge="Hindsight Multi-Hop Agent">
        <form onSubmit={handleSaveAi} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Inference Provider</Label>
              <select value={aiProvider} onChange={e=>setAiProvider(e.target.value)} className={inputCls}>
                <option value="Groq">Groq LPU (Ultra-low latency)</option>
                <option value="OpenAI">OpenAI Enterprise</option>
                <option value="Anthropic">Anthropic Claude</option>
              </select>
            </div>
            <div>
              <Label>Model Identifier</Label>
              <input value={selectedModel} onChange={e=>setSelectedModel(e.target.value)} className={inputCls}/>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Confidence Threshold for Automated Runbooks</Label>
              <span className="text-sm font-bold text-violet-600">{confidenceThreshold}%</span>
            </div>
            <input type="range" min={0} max={100} value={confidenceThreshold} onChange={e=>setConfidenceThreshold(+e.target.value)} className="w-full accent-violet-600 h-2 rounded-full bg-slate-200 appearance-none cursor-pointer"/>
            <Hint>Recommendations below {confidenceThreshold}% will prompt for manual multi-hop root cause investigation.</Hint>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors">Update AI Parameters</button>
          </div>
        </form>
      </Section>

      {/* Section 3: Integrations */}
      <Section icon={Radio} title="Observability Integrations" badge={`${integrations.filter(i=>i.status==='Connected').length} of ${integrations.length} Connected`}>
        <div className="space-y-2">
          {integrations.map(int => (
            <div key={int.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-200 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{int.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">{int.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{int.type}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs">{int.endpoint}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-[10px] text-slate-400 mb-1.5">Last sync: {int.lastSync}</p>
                <button onClick={()=>handleTestInt(int.name)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-700 text-slate-600 transition-colors shadow-sm">
                  <RefreshCw className="w-3 h-3"/>Test Probe
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
