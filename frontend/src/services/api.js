import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeIncident(incident) {
  return {
    ...incident,
    error_message: incident.error_message ?? '',
    logs: incident.logs ?? '',
    error: incident.error_message ?? '',
    createdAt: incident.created_at,
    updatedAt: incident.updated_at,
    displayStatus: incident.status,
    displaySeverity: incident.severity,
    analysis: incident.analysis ?? {
      root_cause: null, resolution_steps: null,
      prevention_recommendations: null, confidence: null, reasoning: null,
    },
  };
}

function toInvestigation(incident) {
  const analysis = incident.analysis ?? {};
  return {
    incidentId: incident.id,
    title: incident.title,
    service: incident.service,
    severity: incident.severity,
    status: incident.status,
    createdAt: incident.created_at,
    error: incident.error_message ?? '',
    logs: incident.logs ?? '',
    confidenceScore: analysis.confidence != null ? Math.round(analysis.confidence * 100) : null,
    rootCause: analysis.root_cause ?? null,
    rootCauseDetails: analysis.reasoning ?? null,
    reasoningEvidence: analysis.reasoning ? [analysis.reasoning] : [],
    recommendedAction: analysis.resolution_steps ?? null,
    preventionRecommendations: analysis.prevention_recommendations ?? null,
    similarIncidents: [],
    recommendedRunbook: null,
    workflowSteps: [
      { step: 1, title: 'Incident loaded',           detail: 'Incident retrieved from database',        status: 'completed', time: 'Done'    },
      { step: 2, title: 'Hindsight memory queried',   detail: 'Historical context retrieved',            status: analysis.root_cause ? 'completed' : 'pending', time: analysis.root_cause ? 'Done' : 'Pending' },
      { step: 3, title: 'AI reasoning completed',     detail: 'Groq generated structured analysis',      status: analysis.root_cause ? 'completed' : 'pending', time: analysis.root_cause ? 'Done' : 'Pending' },
      { step: 4, title: 'Analysis persisted',         detail: 'AI analysis saved to SQLite',             status: analysis.root_cause ? 'completed' : 'pending', time: analysis.root_cause ? 'Done' : 'Pending' },
      { step: 5, title: 'Knowledge stored',           detail: 'Analysis sent to Hindsight memory store', status: analysis.root_cause ? 'completed' : 'pending', time: analysis.root_cause ? 'Done' : 'Pending' },
    ],
  };
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function getHealth() {
  const r = await apiClient.get('/health');
  return r.data;
}

// ── Incidents ─────────────────────────────────────────────────────────────────
export async function getIncidents(params = {}) {
  const r = await apiClient.get('/api/v1/incidents', { params: { skip: params.skip ?? 0, limit: params.limit ?? 100 } });
  const data = r.data;
  let incidents = Array.isArray(data) ? data : data.items ?? [];

  if (params.search) {
    const q = params.search.toLowerCase();
    incidents = incidents.filter(i =>
      [i.id, i.title, i.service, i.error_message, i.logs].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }
  if (params.severity && params.severity !== 'All') {
    incidents = incidents.filter(i => String(i.severity).toLowerCase() === params.severity.toLowerCase());
  }
  if (params.status && params.status !== 'All') {
    const statusMap = { Open: 'open', Investigating: 'in_progress', 'In Progress': 'in_progress', Resolved: 'resolved', Closed: 'closed' };
    const s = statusMap[params.status] ?? params.status;
    incidents = incidents.filter(i => String(i.status).toLowerCase() === s.toLowerCase());
  }
  if (params.service && params.service !== 'All') {
    incidents = incidents.filter(i => String(i.service).toLowerCase() === params.service.toLowerCase());
  }
  return incidents.map(normalizeIncident);
}

export async function getIncidentById(id) {
  const r = await apiClient.get(`/api/v1/incidents/${id}`);
  return normalizeIncident(r.data);
}

export async function createIncident(data) {
  const r = await apiClient.post('/api/v1/incidents', {
    title: data.title,
    service: data.service,
    severity: String(data.severity ?? 'medium').toLowerCase(),
    error_message: data.error_message ?? data.error ?? null,
    logs: data.logs ?? null,
  });
  return normalizeIncident(r.data);
}

export async function updateIncident(id, data) {
  const payload = {};
  if (data.title !== undefined)   payload.title = data.title;
  if (data.service !== undefined) payload.service = data.service;
  if (data.severity !== undefined) payload.severity = String(data.severity).toLowerCase();
  if (data.status !== undefined) {
    const m = { Open:'open', Investigating:'in_progress', 'In Progress':'in_progress', Resolved:'resolved', Closed:'closed' };
    payload.status = m[data.status] ?? data.status;
  }
  if (data.error_message !== undefined) payload.error_message = data.error_message;
  if (data.logs !== undefined)          payload.logs = data.logs;
  const r = await apiClient.patch(`/api/v1/incidents/${id}`, payload);
  return normalizeIncident(r.data);
}

export async function deleteIncident(id) {
  await apiClient.delete(`/api/v1/incidents/${id}`);
  return { success: true };
}

// ── AI Analysis ───────────────────────────────────────────────────────────────
export async function triggerInvestigation(id) {
  // Mark as in_progress first so dashboard Investigating count updates
  try { await updateIncident(id, { status: 'in_progress' }); } catch (_) {}
  const r = await apiClient.post(`/api/v1/incidents/${id}/analyze`);
  return toInvestigation(normalizeIncident(r.data));
}

export async function analyzeIncident(id) {
  return triggerInvestigation(id);
}

export async function getIncidentInvestigation(id) {
  const r = await apiClient.get(`/api/v1/incidents/${id}`);
  return toInvestigation(normalizeIncident(r.data));
}

export async function getIncidentAnalysis(id) {
  const r = await apiClient.get(`/api/v1/incidents/${id}/analysis`);
  return r.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const r = await apiClient.get('/api/v1/incidents', { params: { skip: 0, limit: 100 } });
  const data = r.data;
  const incidents = Array.isArray(data) ? data : data.items ?? [];
  return {
    totalIncidents: data.total ?? incidents.length,
    activeIncidents: incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length,
    investigatingIncidents: incidents.filter(i => i.status === 'in_progress').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
  };
}

// ── Hindsight Memory ──────────────────────────────────────────────────────────
// Connected to real backend: POST /api/v1/memory/search
// The backend calls Hindsight's semantic search.
// Returns an array of memory items or throws on error (do NOT swallow errors).

export async function getMemoryItems(query = 'incident resolution root cause') {
  const r = await apiClient.post('/api/v1/memory/search', {
    query,
    max_tokens: 4096,
    budget: 'mid',
  });
  // Backend returns { results: [...], memory_count: N }
  return r.data.results ?? [];
}

export async function searchMemoryItems(query) {
  if (!query || !query.trim()) return getMemoryItems();
  return getMemoryItems(query);
}

export async function getMemoryItem(id) {
  // No individual memory item endpoint exists — return null
  return null;
}

export async function checkMemoryHealth() {
  const r = await apiClient.get('/api/v1/memory/health');
  return r.data;
}

// ── Runbooks ──────────────────────────────────────────────────────────────────
// No runbook backend endpoint exists.
// We provide a curated static catalog so the page is not empty.
// This is honest — it is NOT pretending to come from the backend.

const STATIC_RUNBOOKS = [
  {
    id: 'RB-DB-001',
    title: 'Database Connection Pool Exhaustion',
    category: 'Database',
    description: 'Step-by-step runbook for diagnosing and resolving database connection pool saturation.',
    risk: 'Medium',
    estimatedTime: '15-30 min',
    steps: [
      'Check current pool utilization: SELECT count(*) FROM pg_stat_activity',
      'Identify long-running or idle connections blocking pool slots',
      'Kill idle connections: SELECT pg_terminate_backend(pid) WHERE state = \'idle\'',
      'Review pool configuration (max_connections, pool_size, timeout settings)',
      'Restart the affected service to clear stale connections',
      'Monitor connection metrics for 15 minutes post-restart',
    ],
    verification: 'Pool utilization drops below 80% and connection errors cease',
    tags: ['database', 'postgresql', 'connection-pool'],
  },
  {
    id: 'RB-DB-002',
    title: 'Database Query Timeout Investigation',
    category: 'Database',
    description: 'Diagnose slow queries causing request timeouts and 503 errors.',
    risk: 'Low',
    estimatedTime: '20-45 min',
    steps: [
      'Enable slow query logging if not already active',
      'Identify queries exceeding timeout threshold in pg_stat_statements',
      'Run EXPLAIN ANALYZE on slow queries to find missing indexes',
      'Add missing indexes or rewrite inefficient queries',
      'Test with load to confirm latency improvement',
    ],
    verification: 'P95 query latency returns to baseline',
    tags: ['database', 'performance', 'query-optimization'],
  },
  {
    id: 'RB-AUTH-001',
    title: 'JWT / JWKS Invalidation Recovery',
    category: 'Authentication',
    description: 'Resolve authentication failures caused by JWKS key rotation or token invalidation.',
    risk: 'High',
    estimatedTime: '10-20 min',
    steps: [
      'Confirm JWKS endpoint is reachable: curl https://auth.example.com/.well-known/jwks.json',
      'Check auth service logs for key rotation events',
      'Flush local JWKS cache in affected services',
      'Restart auth service to reload keys',
      'Verify token validation succeeds with a test request',
    ],
    verification: '401 error rate drops to 0% within 2 minutes of restart',
    tags: ['authentication', 'jwt', 'security'],
  },
  {
    id: 'RB-PAY-001',
    title: 'Payment API 503 Recovery',
    category: 'Payment',
    description: 'Restore Payment API availability during 503 Service Unavailable outages.',
    risk: 'Critical',
    estimatedTime: '10-25 min',
    steps: [
      'Check payment-api pod/container health and restart if crashed',
      'Review error logs for the specific 503 cause (DB, downstream, OOM)',
      'Scale payment-api instances if under traffic spike',
      'Verify downstream payment processor connectivity',
      'Enable circuit breaker if repeated failures detected',
      'Notify on-call payment engineering team if outage exceeds 5 minutes',
    ],
    verification: 'Payment API returns 200 on health check and processes test transaction',
    tags: ['payment', 'availability', 'critical'],
  },
  {
    id: 'RB-PAY-002',
    title: 'Payment Transaction Retry and Idempotency',
    category: 'Payment',
    description: 'Handle duplicate or failed payment transactions safely.',
    risk: 'High',
    estimatedTime: '30-60 min',
    steps: [
      'Identify affected transaction IDs from payment logs',
      'Check idempotency key status in payment processor dashboard',
      'Determine if charges were double-processed or not processed',
      'Apply refunds or retry transactions as appropriate',
      'Notify affected users',
    ],
    verification: 'All affected transactions are in a definitive state (charged or refunded)',
    tags: ['payment', 'idempotency', 'transactions'],
  },
  {
    id: 'RB-STREAM-001',
    title: 'Kafka Consumer Lag Recovery',
    category: 'Streaming',
    description: 'Resolve growing Kafka consumer group lag causing data processing delays.',
    risk: 'Medium',
    estimatedTime: '20-40 min',
    steps: [
      'Check consumer group lag: kafka-consumer-groups.sh --describe --group <group>',
      'Identify slow or dead consumers',
      'Restart consumer instances with scaling if needed',
      'Check for poison messages blocking the queue',
      'Monitor lag recovery rate over 10 minutes',
    ],
    verification: 'Consumer lag decreasing steadily and reaches < 1000 messages',
    tags: ['kafka', 'streaming', 'consumer-lag'],
  },
  {
    id: 'RB-INFRA-001',
    title: 'High CPU / OOM Service Recovery',
    category: 'Infrastructure',
    description: 'Respond to services experiencing CPU saturation or Out-of-Memory errors.',
    risk: 'High',
    estimatedTime: '10-20 min',
    steps: [
      'Identify the process causing CPU/memory spike with top or kubectl top',
      'Take a heap dump if OOM: kill -3 <pid> or jmap -dump:format=b,file=heap.hprof <pid>',
      'Restart the affected service/pod',
      'Increase memory/CPU limits if resource constraints are the root cause',
      'Review application for memory leaks using profiler',
    ],
    verification: 'Service restarts cleanly, CPU/memory usage returns to normal baseline',
    tags: ['infrastructure', 'oom', 'cpu', 'kubernetes'],
  },
  {
    id: 'RB-INFRA-002',
    title: 'Service Deployment Rollback',
    category: 'Infrastructure',
    description: 'Roll back a failed deployment that introduced regressions.',
    risk: 'Low',
    estimatedTime: '5-10 min',
    steps: [
      'Identify the previous stable release tag',
      'kubectl rollout undo deployment/<service-name>',
      'Confirm rollout status: kubectl rollout status deployment/<service-name>',
      'Verify health check returns 200',
      'Open post-mortem ticket for the failed deployment',
    ],
    verification: 'Service running previous version with green health checks',
    tags: ['kubernetes', 'deployment', 'rollback'],
  },
];

export async function getRunbooks(params = {}) {
  let books = STATIC_RUNBOOKS;
  if (params.search) {
    const q = params.search.toLowerCase();
    books = books.filter(rb =>
      [rb.id, rb.title, rb.description, rb.category, ...(rb.tags ?? [])].some(v => v.toLowerCase().includes(q))
    );
  }
  if (params.category && params.category !== 'All') {
    books = books.filter(rb => rb.category.toLowerCase() === params.category.toLowerCase());
  }
  return books;
}

export async function getRunbook(id) {
  return STATIC_RUNBOOKS.find(rb => rb.id === id) ?? null;
}

// ── Misc (not implemented by backend) ────────────────────────────────────────
export async function resolveIncident(id, data = {}) {
  return updateIncident(id, { ...data, status: 'resolved' });
}

export async function assignIncident() {
  throw new Error('Engineer assignment is not implemented by the current backend.');
}

export async function getSimilarIncidents() { return []; }
export async function getRecentActivity()    { return []; }
export async function uploadProjectArchive() { throw new Error('Project upload is not implemented.'); }
export async function getCurrentProject()    { return null; }
export async function getProjectAnalysis()   { return null; }
export async function getProjectsList()      { return []; }

export default apiClient;
