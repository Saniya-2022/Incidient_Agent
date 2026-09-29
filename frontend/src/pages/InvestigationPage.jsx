import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, RefreshCw, AlertCircle,
  Search, Brain, CheckCircle2, Shield, Lightbulb,
  Terminal, Clock, Server, Activity
} from 'lucide-react';
import { getIncidentInvestigation, triggerInvestigation } from '../services/api';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1) return 'just now';
  if (d < 60) return d + 'm ago';
  const h = Math.floor(d / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

const STAGES = [
  { id: 1, label: 'Incident Context',           icon: AlertCircle  },
  { id: 2, label: 'Historical Memory Retrieval', icon: Brain        },
  { id: 3, label: 'AI Root Cause Analysis',      icon: Search       },
  { id: 4, label: 'Resolution Recommendation',   icon: CheckCircle2 },
  { id: 5, label: 'Prevention Recommendations',  icon: Shield       },
];

const ANALYZING_MESSAGES = [
  'Loading incident details...',
  'Querying Hindsight memory for similar incidents...',
  'Building AI analysis context...',
  'Running root cause analysis...',
  'Synthesizing resolution steps...',
];

function AnalysisCard({ icon: Icon, color, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingIncident, setLoadingIncident] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);

  // Step 1: load incident
  useEffect(() => {
    if (!id) return;
    setLoadingIncident(true);
    setError(null);
    getIncidentInvestigation(id)
      .then(data => {
        setIncident(data);
        // If already has analysis, display it immediately
        if (data.rootCause && data.rootCause !== 'Analysis not available yet') {
          setAnalysis(data);
          setCurrentStage(5);
        }
      })
      .catch(e => setError(e?.response?.data?.detail || e?.message || 'Failed to load incident.'))
      .finally(() => setLoadingIncident(false));
  }, [id]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    setCurrentStage(1);
    let msgIdx = 0;
    setAnalyzeMsg(ANALYZING_MESSAGES[0]);

    const interval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, ANALYZING_MESSAGES.length - 1);
      setCurrentStage(msgIdx + 1);
      setAnalyzeMsg(ANALYZING_MESSAGES[msgIdx]);
    }, 1200);

    try {
      const result = await triggerInvestigation(id);
      clearInterval(interval);
      setCurrentStage(5);
      setAnalyzeMsg('');
      setAnalysis(result);
      setIncident(result);
    } catch (e) {
      clearInterval(interval);
      setCurrentStage(0);
      setAnalyzeMsg('');
      setError(e?.response?.data?.detail || e?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingIncident) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 text-violet-500" />
          </div>
          <p className="text-sm text-slate-500">Loading incident...</p>
        </div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Failed to load incident</p>
          <p className="text-xs text-slate-500">{error}</p>
          <button onClick={() => navigate('/incidents')} className="px-4 py-2 text-sm text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">Back to Incidents</button>
        </div>
      </div>
    );
  }

  const hasAnalysis = analysis && analysis.rootCause && analysis.rootCause !== 'Analysis not available yet';

  return (
    <div className="space-y-5 animate-in fade-in duration-300 max-w-5xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-200">
        <div>
          <button onClick={() => navigate('/incidents')} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-600 transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Incidents
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">#{id}</span>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">AI INCIDENT INVESTIGATION</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mt-0.5">{incident?.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-13 flex-wrap ml-[52px]">
            <SeverityBadge severity={incident?.severity} />
            <StatusBadge status={incident?.status} />
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">{incident?.service}</span>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : hasAnalysis ? 'Re-run Analysis' : 'Run AI Analysis'}
        </button>
      </div>

      {/* ── SECTION 1: INCIDENT OVERVIEW ───────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Incident Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { icon: Server,   label: 'Service',  value: incident?.service,   color: 'bg-blue-50 text-blue-600'   },
            { icon: Activity, label: 'Severity', value: incident?.severity,  color: 'bg-red-50 text-red-600'     },
            { icon: AlertCircle, label: 'Status',value: incident?.status?.replace('_',' '), color: 'bg-violet-50 text-violet-600' },
            { icon: Clock,    label: 'Reported', value: timeAgo(incident?.createdAt || incident?.created_at), color: 'bg-slate-50 text-slate-600' },
          ].map(card => (
            <div key={card.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}><card.icon className="w-4 h-4" /></div>
              <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p><p className="text-sm font-semibold text-slate-800 capitalize">{card.value || '—'}</p></div>
            </div>
          ))}
        </div>
        {incident?.error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Error Message</p>
            <p className="text-sm text-red-700 font-mono">{incident.error}</p>
          </div>
        )}
      </div>

      {/* ── SECTION 2: LOGS ────────────────────────────────── */}
      {incident?.logs && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logs & Evidence</h2>
          </div>
          <pre className="bg-slate-900 text-emerald-300 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">{incident.logs}</pre>
        </div>
      )}

      {/* ── SECTION 3: AI INVESTIGATION STAGES ────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Investigation Pipeline</h2>
        </div>

        {analyzing && (
          <div className="mb-4 p-3.5 bg-violet-50 border border-violet-200 rounded-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-sm text-violet-700 font-medium">{analyzeMsg}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {STAGES.map((stage, i) => {
            const done = currentStage > i;
            const active = currentStage === i + 1 && analyzing;
            return (
              <div key={stage.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                done   ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                active ? 'bg-violet-50 border-violet-300 text-violet-700 animate-pulse' :
                         'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> :
                 active ? <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /> :
                 <stage.icon className="w-3.5 h-3.5" />}
                {stage.label}
              </div>
            );
          })}
        </div>

        {!hasAnalysis && !analyzing && !error && (
          <p className="text-sm text-slate-400 mt-4">Click <strong className="text-violet-600">Run AI Analysis</strong> to start the investigation.</p>
        )}
      </div>

      {/* ── ANALYSIS RESULTS (shown only after analysis) ───── */}
      {hasAnalysis && (
        <>
          {/* Root Cause */}
          <AnalysisCard icon={Search} color="bg-red-50 text-red-600" title="Root Cause">
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.rootCause}</p>
          </AnalysisCard>

          {/* Historical Memory */}
          <AnalysisCard icon={Brain} color="bg-indigo-50 text-indigo-600" title="Hindsight Memory">
            {analysis.similarIncidents && analysis.similarIncidents.length > 0 ? (
              <div className="space-y-2">
                {analysis.similarIncidents.map((s, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">{typeof s === 'string' ? s : JSON.stringify(s)}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Historical incident context was retrieved from Hindsight memory and used to inform this analysis. No exact duplicate incidents found.</p>
            )}
          </AnalysisCard>

          {/* Resolution Steps */}
          <AnalysisCard icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" title="Recommended Resolution">
            <div className="space-y-1.5">
              {(analysis.recommendedAction || '').split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </AnalysisCard>

          {/* Prevention */}
          {analysis.preventionRecommendations && (
            <AnalysisCard icon={Shield} color="bg-amber-50 text-amber-600" title="Prevention Recommendations">
              <div className="space-y-1.5">
                {analysis.preventionRecommendations.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{line.replace(/^[-•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Confidence */}
          {analysis.confidenceScore != null && (
            <AnalysisCard icon={Activity} color="bg-violet-50 text-violet-600" title="AI Confidence">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7C3AED" strokeWidth="3"
                      strokeDasharray={`${analysis.confidenceScore} ${100 - analysis.confidenceScore}`} strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-700">{analysis.confidenceScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{analysis.confidenceScore}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI confidence in this root cause assessment</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden w-48">
                    <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: analysis.confidenceScore + '%' }} />
                  </div>
                </div>
              </div>
            </AnalysisCard>
          )}

          {/* Human Review */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Human Review Required</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              The AI has completed its analysis. An engineer should review the root cause and recommended resolution steps before applying any changes to production.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => alert('Resolution approval: connect to backend when the endpoint is available.')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">
                <CheckCircle2 className="w-4 h-4" />Approve Resolution
              </button>
              <button onClick={() => alert('Dismissed. You may re-run analysis.')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 rounded-xl transition-colors">
                Reject
              </button>
              <button onClick={() => navigate('/incidents')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" />Back to Incidents
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
