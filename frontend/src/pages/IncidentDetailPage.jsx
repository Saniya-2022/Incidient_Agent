import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Server,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import LogViewer from '../components/incident/LogViewer';
import IncidentTimeline from '../components/incident/IncidentTimeline';
import AssignModal from '../components/incident/AssignModal';
import ResolveModal from '../components/incident/ResolveModal';
import RunbookModal from '../components/runbooks/RunbookModal';
import MemoryDetailDrawer from '../components/memory/MemoryDetailDrawer';
import {
  getIncidentById,
  getIncidentInvestigation,
  getRunbook,
  getMemoryItem,
} from '../services/api';
import { useApp } from '../context/AppContext';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshTrigger } = useApp();

  const [incident, setIncident] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [selectedMemoryItem, setSelectedMemoryItem] = useState(null);

  useEffect(() => {
    async function loadIncidentDetails() {
      setLoading(true);
      try {
        const [incData, invData] = await Promise.all([
          getIncidentById(id),
          getIncidentInvestigation(id),
        ]);
        setIncident(incData);
        setInvestigation(invData);
      } catch (err) {
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIncidentDetails();
  }, [id, refreshTrigger]);

  const handleOpenRunbook = async (runbookId) => {
    try {
      const rb = await getRunbook(runbookId);
      setSelectedRunbook(rb);
    } catch (err) {
      console.error('Error fetching runbook:', err);
    }
  };

  const handleOpenSimilarMemory = async (similarId) => {
    try {
      const mem = await getMemoryItem(similarId);
      setSelectedMemoryItem(mem);
    } catch (err) {
      console.error('Error fetching memory item:', err);
    }
  };

  if (loading && !incident) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#151D2E] rounded w-48 animate-pulse" />
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Incident {id} not found.</p>
        <Link to="/incidents" className="text-purple-400 hover:underline text-xs mt-2 inline-block">
          Return to incidents queue
        </Link>
      </div>
    );
  }

  const primarySimilar = investigation?.similarIncidents?.[0] || {
    id: 'INC-0871',
    similarity: 92,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </Link>
        <div className="text-xs font-mono text-gray-400">
          Source: <span className="text-gray-200">{incident.source || 'Datadog'}</span>
        </div>
      </div>

      {/* Incident Header */}
      <div className="bg-card rounded-lg border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-mono font-bold text-purple-400">
              {incident.id}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="text-xs text-gray-400 font-mono">
              Detected {incident.detected}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
            {incident.title}
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Service: <span className="text-gray-200">{incident.service}</span> • Assigned to:{' '}
            <span className="text-gray-200">{incident.assignee || 'Unassigned'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#151D2E] hover:bg-card border border-border text-gray-200 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>Assign</span>
          </button>

          <button
            onClick={() => navigate(`/investigation/${incident.id}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 shadow-glow-ai transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Investigate with AI</span>
          </button>

          {incident.status !== 'Resolved' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve Incident</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Incident Info + Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Incident Information Card */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono mb-4 pb-2 border-b border-border">
              Incident Information
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Service</span>
                <span className="text-gray-200 font-medium">{incident.service}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Severity</span>
                <span className="text-red-400 font-semibold">{incident.severity}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Status</span>
                <span className="text-purple-300">{incident.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Detected</span>
                <span className="text-gray-300">{incident.detected}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Source Alert</span>
                <span className="text-gray-300">{incident.source || 'Datadog'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Environment</span>
                <span className="text-gray-300">{incident.environment || 'Production'}</span>
              </div>
            </div>

            {/* Error Detail Box */}
            <div className="mt-4 pt-4 border-t border-border/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">
                Primary Error Signature
              </span>
              <div className="p-3 rounded-lg bg-[#0e1422] border border-border font-mono text-xs text-red-300 break-all select-all">
                {incident.error}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                <span>Timestamp: {incident.detectedTimestamp || '2026-09-28 22:31:04 UTC'}</span>
                <span>Incident ID: {incident.id}</span>
              </div>
            </div>

            {/* Incident Summary */}
            {incident.summary && (
              <div className="mt-4 pt-3 border-t border-border/70 text-xs text-gray-300 leading-relaxed">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  Incident Summary
                </span>
                {incident.summary}
              </div>
            )}
          </div>

          {/* Incident Logs Viewer */}
          <LogViewer logs={incident.logs || []} incidentId={incident.id} />
        </div>

        {/* RIGHT COLUMN: AI Investigation Analysis + Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Investigation Card */}
          <div className="bg-[#121626] rounded-lg border border-purple-500/40 p-5 shadow-glow-ai">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
                  AI Investigation
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Confidence: {investigation?.confidenceScore || 94}%
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Similar Incident */}
              <div className="p-3 bg-[#0B1020] rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Similar Historical Incident
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-purple-400 text-sm">
                      {primarySimilar.id}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
                      {primarySimilar.similarity}% similarity
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenSimilarMemory(primarySimilar.id)}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[#151D2E] hover:bg-card border border-border text-gray-300 flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </button>
              </div>

              {/* Root Cause */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Identified Root Cause
                </span>
                <p className="font-semibold text-gray-100 text-xs mt-0.5 font-mono">
                  {investigation?.rootCause || 'Database connection pool exhausted'}
                </p>
              </div>

              {/* Evidence Bullets */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  Evidence
                </span>
                <ul className="space-y-1 text-gray-300 text-xs">
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-mono">•</span>
                    <span>ConnectionTimeout errors spike after traffic surge</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-mono">•</span>
                    <span>DB pool reached maximum hard ceiling of 50</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-mono">•</span>
                    <span>Matches historical incident {primarySimilar.id} pattern</span>
                  </li>
                </ul>
              </div>

              {/* Previous Resolution */}
              <div className="p-3 bg-[#151D2E] rounded-lg border border-border">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Previous Resolution
                </span>
                <p className="text-emerald-300 text-xs mt-0.5 leading-snug">
                  Restarted connection pool and increased max connections to 150.
                </p>
              </div>

              {/* Recommended Runbook */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Recommended Runbook
                  </span>
                  <span className="font-mono font-semibold text-gray-200">
                    {investigation?.recommendedRunbook?.id || 'DB-CONNECTION-POOL-01'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleOpenRunbook(
                      investigation?.recommendedRunbook?.id || 'DB-CONNECTION-POOL-01'
                    )
                  }
                  className="px-2.5 py-1 text-xs font-mono rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-200 flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3 text-purple-300" />
                  <span>View Runbook</span>
                </button>
              </div>

              {/* Link to Full Investigation */}
              <div className="pt-2 border-t border-border/80">
                <button
                  onClick={() => navigate(`/investigation/${incident.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-glow-ai transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Full AI Investigation Suite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <IncidentTimeline timeline={incident.timeline || []} />
        </div>
      </div>

      {/* Modals & Slide-over Drawers */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        incident={incident}
        onAssigned={(newAssignee) => setIncident((prev) => ({ ...prev, assignee: newAssignee }))}
      />

      <ResolveModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        incident={incident}
        onResolved={() => setIncident((prev) => ({ ...prev, status: 'Resolved' }))}
      />

      <RunbookModal
        isOpen={!!selectedRunbook}
        onClose={() => setSelectedRunbook(null)}
        runbook={selectedRunbook}
      />

      <MemoryDetailDrawer
        isOpen={!!selectedMemoryItem}
        onClose={() => setSelectedMemoryItem(null)}
        memoryItem={selectedMemoryItem}
        onViewRunbook={handleOpenRunbook}
      />
    </div>
  );
}
