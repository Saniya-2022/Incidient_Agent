// Frontend configuration for Incident Response Agent
// Built to connect seamlessly with future FastAPI backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const APP_CONFIG = {
  appName: 'IR Agent',
  appSubtitle: 'Incident Response',
  version: '2.4.0-sre',
  defaultEnvironment: 'Production',
  environments: ['Production', 'Staging', 'Dev-Cluster-01'],
  aiProvider: 'Groq',
  defaultAiModel: 'openai/gpt-oss-120b',
  mockLatencyMs: 350, // simulated latency for realistic frontend UX
  confidenceThreshold: 80,
  autoRefreshInterval: 30000,
};
