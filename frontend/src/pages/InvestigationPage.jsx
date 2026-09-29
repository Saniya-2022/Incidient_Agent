import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Search,
} from 'lucide-react';
import InvestigationProgress from '../components/investigation/InvestigationProgress';
import RecommendationCard from '../components/investigation/RecommendationCard';
import SimilarIncidentCard from '../components/investigation/SimilarIncidentCard';
import RunbookModal from '../components/runbooks/RunbookModal';
import MemoryDetailDrawer from '../components/memory/MemoryDetailDrawer';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  getIncidentInvestigation,
  triggerInvestigation,
  getRunbook,
  getMemoryItem,
  resolveIncident,
} from '../services/api';
import { useApp } from '../context/AppContext';

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast, triggerRefresh } = useApp();

  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReinvestigating, setIsReinvestigating] = useState(false);
  const [investigationStepText, setInvestigationStepText] = useState('');

  // Modals
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [selectedMemoryItem, setSelectedMemoryItem] = useState(null);

  useEffect(() => {
    async function loadInvestigation() {
      setLoading(true);
      try {
        const data = await getIncidentInvestigation(id || 'INC-1024');
        setInvestigation(data);
      } catch (err) {
        console.error('Error fetching investigation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvestigation();
  }, [id]);

  // Simulate dynamic interactive investigation re-run
  const handleReRunInvestigation = async () => {
    setIsReinvestigating(true);
    const steps = [
      'Parsing incident telemetry and error logs...',
      'Retrieving similar failure signatures from Hindsight memory vector store...',
      'Constructing context window with historical post-mortems and runbooks...',
      'Performing multi-hop causal reasoning...',
      'Synthesizing safe non-destructive mitigation recommendation...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setInvestigationStepText(steps[i]);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const updated = await triggerInvestigation(id || 'INC-1024');
      setInvestigation(updated);
      addToast({
        title: 'Investigation Refreshed',
        message: 'AI analyzed latest telemetry and confirmed root cause hypothesis.',
        type: 'ai',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsReinvestigating(false);
      setInvestigationStepText('');
    }
  };

  const handleOpenRunbook = async (runbookId) => {
    try {
      const rb = await getRunbook(runbookId);
      setSelectedRunbook(rb);
    } catch (err) {
      console.error('Error loading runbook:', err);
    }
  };

  const handleOpenMemory = async (similarId) => {
    try {
      const mem = await getMemoryItem(similarId);
      setSelectedMemoryItem(mem);
    } catch (err) {
      console.error('Error loading memory:', err);
    }
  };

  const handleApproveResolution = async () => {
    try {
      await resolveIncident(id || 'INC-1024', {
        notes: investigation?.recommendedAction,
        whatWorked: 'Executed recommended runbook DB-CONNECTION-POOL-01 after AI diagnosis.',
        whatFailed: 'N/A',
        lessonsLearned: 'Proactive pool monitoring prevents downstream cascading 503s.',
        runbookId: investigation?.recommendedRunbook?.id || 'DB-CONNECTION-POOL-01',
      });
      addToast({
        title: 'Resolution Approved & Applied',
        message: `${id || 'INC-1024'} mitigation executed. Incident marked resolved & indexed in Hindsight.`,
        type: 'success',
      });
      triggerRefresh();
      // Navigate to incident details or memory
      navigate(`/incidents/${id || 'INC-1024'}`);
    } catch (err) {
      addToast({
        title: 'Approval Execution Error',
        message: err.message,
        type: 'critical',
      });
    }
  };

  const handleRejectResolution = () => {
    addToast({
      title: 'Recommendation Dismissed',
      message: 'AI recommendation rejected by engineer. You may re-run or manually investigate.',
      type: 'warning',
    });
  };

  if (loading && !investigation) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#151D2E] rounded w-64 animate-pulse" />
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <Link
            to={`/incidents/${id || 'INC-1024'}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Incident {id || 'INC-1024'}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              AI Investigation
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300">
              {investigation?.incidentId}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {investigation?.title} • Service: {investigation?.service}
          </p>
        </div>

        {/* Re-run button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReRunInvestigation}
            disabled={isReinvestigating}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#151D2E] hover:bg-card border border-border text-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReinvestigating ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isReinvestigating ? 'Reasoning...' : 'Re-run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Reasoning Banner during Re-investigation */}
      {isReinvestigating && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/50 rounded-xl shadow-glow-ai flex items-center gap-3 text-xs text-purple-200 animate-pulse">
          <Sparkles className="w-5 h-5 text-purple-300 shrink-0" />
          <div>
            <span className="font-semibold block font-mono">Agent Reasoning in Progress:</span>
            <p className="text-purple-300/90 font-mono mt-0.5">{investigationStepText}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Workflow on Left + Core AI Recommendation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 6-Stage Progress Stepper */}
        <div className="lg:col-span-4 space-y-6">
          <InvestigationProgress steps={investigation?.workflowSteps || []} />

          {/* Hindsight Vector Memory Stats Card */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
                Memory Retrieval Context
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Cosine 0.92</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hindsight memory searched <strong className="text-gray-200">1,248 historical incidents</strong> and selected the top matches with root cause correlation.
            </p>
            <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
              <span>Embedding model: text-embedding-3-large</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis & Recommendation + Similar Incidents */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main AI Recommendation Card with strict Human Approval required */}
          <RecommendationCard
            investigation={investigation}
            onApprove={handleApproveResolution}
            onReject={handleRejectResolution}
            onViewRunbook={handleOpenRunbook}
          />

          {/* Similar Incidents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                Retrieved Similar Historical Incidents
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                Ranked by Vector Similarity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {investigation?.similarIncidents &&
                investigation.similarIncidents.map((item) => (
                  <SimilarIncidentCard
                    key={item.id}
                    item={item}
                    onClick={() => handleOpenMemory(item.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Slide-over Drawers */}
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
