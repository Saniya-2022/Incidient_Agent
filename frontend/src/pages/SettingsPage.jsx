import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  Layers,
  Radio,
  Bell,
  CheckCircle2,
  Shield,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';

export default function SettingsPage() {
  const { environment, setEnvironment, addToast } = useApp();

  // General Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefreshRate, setAutoRefreshRate] = useState('30s');

  // AI Configuration
  const [aiProvider, setAiProvider] = useState('Groq');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [autoTriageEnabled, setAutoTriageEnabled] = useState(true);

  // Integrations state
  const [integrations, setIntegrations] = useState([
    {
      id: 'datadog',
      name: 'Datadog',
      type: 'Metrics & APM',
      status: 'Connected',
      endpoint: 'https://api.datadoghq.com/api/v1/events',
      lastSync: '2 min ago',
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      type: 'Time-series Alerting',
      status: 'Connected',
      endpoint: 'http://prometheus-k8s.monitoring.svc:9090',
      lastSync: 'Just now',
    },
    {
      id: 'grafana',
      name: 'Grafana',
      type: 'Observability Dashboards',
      status: 'Connected',
      endpoint: 'https://grafana.internal.infra/api',
      lastSync: '15 min ago',
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'Incident Channel Bot (#incident-war-room)',
      status: 'Connected',
      endpoint: 'hooks.slack.com/services/T00/B00/X00',
      lastSync: '1 min ago',
    },
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      type: 'On-Call Rotation & Escalation',
      status: 'Connected',
      endpoint: 'https://api.pagerduty.com/incidents',
      lastSync: '3 min ago',
    },
  ]);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    addToast({
      title: 'Settings Saved',
      message: 'General configuration preferences updated.',
      type: 'success',
    });
  };

  const handleSaveAi = (e) => {
    e.preventDefault();
    addToast({
      title: 'AI Model Configuration Updated',
      message: `Active provider: ${aiProvider} (${selectedModel}) with ${confidenceThreshold}% threshold.`,
      type: 'ai',
    });
  };

  const handleTestIntegration = (name) => {
    addToast({
      title: 'Integration Probe OK',
      message: `Handshake test with ${name} API succeeded (HTTP 200).`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            Platform Settings
          </h1>
          <span className="text-xs font-mono text-gray-400 bg-[#151D2E] px-2 py-0.5 rounded border border-border">
            Configuration
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage environment variables, AI reasoning parameters, and observability integrations.
        </p>
      </div>

      {/* SECTION 1: General Settings */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wider font-mono">
            General Preferences
          </h2>
        </div>

        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
              Active Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              {APP_CONFIG.environments.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Restricts telemetry ingestion to selected cluster.
            </span>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
              Theme
            </label>
            <input
              type="text"
              readOnly
              value="SRE Dark (#0B1020)"
              className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-400 font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Developer & SRE high-contrast dark palette.
            </span>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
              Notifications
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#151D2E] border border-border">
              <span className="text-gray-200">
                {notificationsEnabled ? 'Enabled' : 'Muted'}
              </span>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  notificationsEnabled ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Audio and push alerts for P1 critical events.
            </span>
          </div>
        </form>
      </div>

      {/* SECTION 2: AI Configuration */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wider font-mono">
              AI Configuration & Model Tuning
            </h2>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
            Hindsight Multi-Hop Agent
          </span>
        </div>

        <form onSubmit={handleSaveAi} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
                Inference Provider
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
              >
                <option value="Groq">Groq LPU (Ultra-low latency)</option>
                <option value="OpenAI">OpenAI Enterprise</option>
                <option value="Anthropic">Anthropic Claude</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
                Model Identifier
              </label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-300 font-semibold font-mono uppercase tracking-wider text-[11px]">
                Confidence Threshold for Suggested Runbooks
              </label>
              <span className="font-mono text-purple-400 font-bold">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Recommendations below {confidenceThreshold}% will prompt for manual multi-hop root-cause investigation.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-glow-ai transition-colors"
            >
              Update AI Parameters
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Integrations */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wider font-mono">
              Integrations & Webhooks
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">
            5 of 5 Connected
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100">{item.name}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.type}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{item.endpoint}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-400">
                  Last sync: {item.lastSync}
                </span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration(item.name)}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[#151D2E] hover:bg-card border border-border text-gray-300 hover:text-white transition-colors"
                >
                  Test Probe
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
