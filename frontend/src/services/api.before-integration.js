// API Service Abstraction Layer for Incident Response Agent
// Built to interface directly with FastAPI backend when available, with resilient mock fallback

import axios from 'axios';
import { API_BASE_URL, APP_CONFIG } from '../config';
import {
  mockDashboardStats,
  mockIncidents,
  mockAiInvestigations,
  mockRunbooks,
  mockMemoryItems,
  mockRecentActivity,
} from '../data/mockData';
import { parseProjectZip } from '../utils/zipParser';

// Configure Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Helper for simulated delay when using fallback mock data
const delay = (ms = APP_CONFIG.mockLatencyMs) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state for mock fallback so mutations (resolve, assign) reflect immediately in UI
let localIncidents = [...mockIncidents];
let localMemory = [...mockMemoryItems];

/**
 * Dashboard & Summary Statistics
 * GET /api/dashboard/stats
 */
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    console.info('[API:Fallback] Using mock dashboard stats:', error.message);
    await delay();
    return {
      ...mockDashboardStats,
      activeIncidents: localIncidents.filter((i) => i.status !== 'Resolved').length,
      investigatingIncidents: localIncidents.filter((i) => i.status === 'Investigating').length,
    };
  }
}

/**
 * Get all incidents with optional filtering
 * GET /api/incidents
 */
export async function getIncidents(params = {}) {
  try {
    const response = await apiClient.get('/api/incidents', { params });
    return response.data;
  } catch (error) {
    console.info('[API:Fallback] Using mock incidents:', error.message);
    await delay();
    let result = [...localIncidents];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.service.toLowerCase().includes(q) ||
          i.error.toLowerCase().includes(q)
      );
    }
    if (params.severity && params.severity !== 'All') {
      result = result.filter((i) => i.severity.toLowerCase() === params.severity.toLowerCase());
    }
    if (params.status && params.status !== 'All') {
      result = result.filter((i) => i.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.service && params.service !== 'All') {
      result = result.filter((i) => i.service.toLowerCase() === params.service.toLowerCase());
    }

    return result;
  }
}

/**
 * Get incident by ID
 * GET /api/incidents/{id}
 */
export async function getIncidentById(id) {
  try {
    const response = await apiClient.get(`/api/incidents/${id}`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Using mock for incident ${id}:`, error.message);
    await delay();
    const found = localIncidents.find((i) => i.id === id);
    if (!found) {
      // Fallback default if not found
      return localIncidents[0];
    }
    return found;
  }
}

/**
 * Get AI Investigation for an incident
 * GET /api/incidents/{id}/investigate or GET /api/investigation/{id}
 */
export async function getIncidentInvestigation(id) {
  try {
    const response = await apiClient.get(`/api/incidents/${id}/investigate`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Using mock investigation for ${id}:`, error.message);
    await delay();
    if (mockAiInvestigations[id]) {
      return mockAiInvestigations[id];
    }
    // Dynamic generated mock if specific ID isn't pre-populated
    const incident = localIncidents.find((i) => i.id === id) || localIncidents[0];
    return {
      incidentId: incident.id,
      title: incident.title,
      service: incident.service,
      confidenceScore: 91,
      status: 'Awaiting engineer review',
      rootCause: incident.rootCause || 'Upstream service degradation and timeout cascade',
      rootCauseDetails: `AI analysis of ${incident.service} logs reveals elevated error rates matching historical failure signatures.`,
      reasoningEvidence: [
        `Observed error signature: ${incident.error}`,
        `Service ${incident.service} telemetry indicates saturation during peak traffic window.`,
        'Correlated with historical incidents stored in Hindsight memory.',
      ],
      similarIncidents: [
        {
          id: 'INC-0871',
          title: 'Payment Checkout DB Pool Starvation',
          service: incident.service,
          similarity: 88,
          date: '2026-07-14',
          rootCause: 'Connection saturation',
          resolution: 'Pool configuration adjustment',
          verifiedBy: 'Alex Chen',
        },
      ],
      recommendedAction: 'Apply recommended mitigation runbook and review resource allocation limits.',
      recommendedRunbook: {
        id: 'DB-CONNECTION-POOL-01',
        title: 'Database Connection Pool Recovery',
        category: 'Database',
        estimatedTime: '4 min',
        riskLevel: 'Low',
      },
      workflowSteps: [
        { step: 1, title: 'Incident parsed', detail: `Parsed ${incident.service} incident data`, status: 'completed', time: 'Just now' },
        { step: 2, title: 'Similar incidents searched', detail: 'Found 2 historical matches', status: 'completed', time: 'Just now' },
        { step: 3, title: 'Context built', detail: 'Telemetry combined with runbook specs', status: 'completed', time: 'Just now' },
        { step: 4, title: 'AI reasoning completed', detail: 'Generated root cause hypotheses', status: 'completed', time: 'Just now' },
        { step: 5, title: 'Recommendation generated', detail: 'Mitigation recommendation created', status: 'completed', time: 'Just now' },
        { step: 6, title: 'Awaiting engineer review', detail: 'Human sign-off required', status: 'pending', time: 'Active' },
      ],
    };
  }
}

/**
 * Trigger AI Re-investigation
 * POST /api/incidents/{id}/investigate
 */
export async function triggerInvestigation(id) {
  try {
    const response = await apiClient.post(`/api/incidents/${id}/investigate`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Simulating AI investigation for ${id}:`, error.message);
    await delay(1200); // realistic time for AI reasoning simulation
    return getIncidentInvestigation(id);
  }
}

/**
 * Get Similar Incidents
 * GET /api/incidents/{id}/similar
 */
export async function getSimilarIncidents(id) {
  try {
    const response = await apiClient.get(`/api/incidents/${id}/similar`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Using mock similar incidents for ${id}:`, error.message);
    await delay();
    const inv = mockAiInvestigations[id];
    return inv ? inv.similarIncidents : mockAiInvestigations['INC-1024'].similarIncidents;
  }
}

/**
 * Get Hindsight Memory items
 * GET /api/memory
 */
export async function getMemoryItems(params = {}) {
  try {
    const response = await apiClient.get('/api/memory', { params });
    return response.data;
  } catch (error) {
    console.info('[API:Fallback] Using mock memory items:', error.message);
    await delay();
    let result = [...localMemory];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.incidentId.toLowerCase().includes(q) ||
          m.service.toLowerCase().includes(q) ||
          m.rootCause.toLowerCase().includes(q) ||
          m.resolution.toLowerCase().includes(q) ||
          (m.lessonsLearned && m.lessonsLearned.toLowerCase().includes(q))
      );
    }
    if (params.service && params.service !== 'All') {
      result = result.filter((m) => m.service.toLowerCase() === params.service.toLowerCase());
    }
    if (params.severity && params.severity !== 'All') {
      result = result.filter((m) => m.severity.toLowerCase() === params.severity.toLowerCase());
    }

    return result;
  }
}

/**
 * Get single memory item
 * GET /api/memory/{id}
 */
export async function getMemoryItem(id) {
  try {
    const response = await apiClient.get(`/api/memory/${id}`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Using mock memory detail for ${id}:`, error.message);
    await delay();
    return localMemory.find((m) => m.id === id || m.incidentId === id) || localMemory[0];
  }
}

/**
 * Get Runbooks
 * GET /api/runbooks
 */
export async function getRunbooks(params = {}) {
  try {
    const response = await apiClient.get('/api/runbooks', { params });
    return response.data;
  } catch (error) {
    console.info('[API:Fallback] Using mock runbooks:', error.message);
    await delay();
    let result = [...mockRunbooks];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'All') {
      result = result.filter((r) => r.category.toLowerCase() === params.category.toLowerCase());
    }

    return result;
  }
}

/**
 * Get Runbook by ID
 * GET /api/runbooks/{id}
 */
export async function getRunbook(id) {
  try {
    const response = await apiClient.get(`/api/runbooks/${id}`);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Using mock runbook ${id}:`, error.message);
    await delay();
    return mockRunbooks.find((r) => r.id === id) || mockRunbooks[0];
  }
}

/**
 * Resolve an incident and optionally record outcome in Hindsight memory
 * POST /api/incidents/{id}/resolve
 */
export async function resolveIncident(id, data = {}) {
  try {
    const response = await apiClient.post(`/api/incidents/${id}/resolve`, data);
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Simulating resolve for incident ${id}:`, error.message);
    await delay();
    
    // Update local incident in-memory
    const idx = localIncidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      localIncidents[idx] = {
        ...localIncidents[idx],
        status: 'Resolved',
        resolutionNotes: data.notes || 'Resolved via AI suggested runbook execution.',
      };
      
      // Append timeline event
      localIncidents[idx].timeline.push({
        time: 'Just now',
        title: 'Incident resolved',
        desc: data.notes || 'Engineer verified resolution and closed incident.',
        status: 'resolved',
      });
      localIncidents[idx].timeline.push({
        time: 'Just now',
        title: 'Outcome stored in memory',
        desc: 'Resolution parameters and learnings indexed in Hindsight.',
        status: 'memory',
      });

      // Add to local Hindsight memory
      const newMemoryItem = {
        id: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
        incidentId: id,
        service: localIncidents[idx].service,
        severity: localIncidents[idx].severity,
        title: localIncidents[idx].title,
        rootCause: localIncidents[idx].rootCause,
        resolution: data.notes || 'Runbook remediation executed successfully',
        similarity: 95,
        date: new Date().toISOString().split('T')[0],
        outcome: 'Resolved in 18m',
        whatWorked: data.whatWorked || 'Applied recommended config adjustment and performed rolling restart.',
        whatFailed: data.whatFailed || 'Initial thread kill failed to clear the HikariCP queue.',
        engineerNotes: data.notes || 'Validated zero 503 errors on edge proxies.',
        runbook: data.runbookId || 'DB-CONNECTION-POOL-01',
        lessonsLearned: data.lessonsLearned || 'Early saturation alerts prevent customer-facing dropouts.',
        verifiedBy: data.engineer || 'Alex Chen (Engineer)',
      };
      localMemory.unshift(newMemoryItem);
    }

    return {
      success: true,
      incidentId: id,
      status: 'Resolved',
      message: 'Incident marked as resolved. Outcome stored in Hindsight memory.',
    };
  }
}

/**
 * Assign engineer to incident
 * POST /api/incidents/{id}/assign
 */
export async function assignIncident(id, assignee) {
  try {
    const response = await apiClient.post(`/api/incidents/${id}/assign`, { assignee });
    return response.data;
  } catch (error) {
    console.info(`[API:Fallback] Simulating assign for ${id}:`, error.message);
    await delay();
    const idx = localIncidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      localIncidents[idx] = {
        ...localIncidents[idx],
        assignee,
      };
      localIncidents[idx].timeline.push({
        time: 'Just now',
        title: 'Engineer assigned',
        desc: `${assignee} assigned to lead response.`,
        status: 'user',
      });
    }
    return { success: true, assignee };
  }
}

/**
 * Get Recent Activity Feed
 * GET /api/activity
 */
export async function getRecentActivity() {
  try {
    const response = await apiClient.get('/api/activity');
    return response.data;
  } catch (error) {
    await delay(150);
    return mockRecentActivity;
  }
}

/**
 * Project Onboarding & Monitoring API Endpoints
 * (Backend Contract for FastAPI integration)
 */

let localProjects = [];

/**
 * Upload a project ZIP archive
 * POST /api/projects/upload
 */
export async function uploadProjectArchive(file, customName = '', onUploadProgress = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (customName) {
      formData.append('name', customName);
    }

    const response = await apiClient.post('/api/projects/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.info('[API:Fallback] Processing real ZIP archive locally:', error.message);
    // Real parsing of the user's uploaded ZIP file
    const realProject = await parseProjectZip(file, customName);
    localProjects = [realProject, ...localProjects.filter((p) => p.id !== realProject.id)];
    return realProject;
  }
}

/**
 * Get currently monitored project
 * GET /api/projects/current
 */
export async function getCurrentProject() {
  try {
    const response = await apiClient.get('/api/projects/current');
    return response.data;
  } catch (error) {
    return localProjects[0] || null;
  }
}

/**
 * Get project analysis details
 * GET /api/projects/{id}/analysis
 */
export async function getProjectAnalysis(projectId) {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}/analysis`);
    return response.data;
  } catch (error) {
    await delay(200);
    const found = localProjects.find((p) => p.id === projectId);
    return found || null;
  }
}

/**
 * List all uploaded projects
 * GET /api/projects
 */
export async function getProjectsList() {
  try {
    const response = await apiClient.get('/api/projects');
    return response.data;
  } catch (error) {
    return localProjects;
  }
}

