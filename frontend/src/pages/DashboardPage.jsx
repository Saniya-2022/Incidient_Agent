import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  ShieldAlert,
  Boxes,
  Cpu,
  BrainCircuit,
  ArrowRight,
  FolderGit2,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProjectUpload from '../components/project/ProjectUpload';
import ProjectAnalysisStatus from '../components/project/ProjectAnalysisStatus';
import IncidentDashboard from '../components/project/IncidentDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, uploadState, setUploadState, addToast } = useApp();

  // Mode: if user has a project and wants to upload a new one, this flips to true
  const [showUploadModal, setShowUploadModal] = useState(false);

  // If currently uploading/analyzing/ready, show the ProjectAnalysisStatus screen
  const isAnalyzing =
    uploadState.status === 'uploading' ||
    uploadState.status === 'analyzing' ||
    uploadState.status === 'ready';

  const handleNavigateToDashboard = () => {
    if (uploadState.projectData) {
      setCurrentProject(uploadState.projectData);
    }
    setUploadState({
      status: 'idle',
      progress: 0,
      projectData: null,
      error: null,
    });
    setShowUploadModal(false);
  };

  // Case 1: Analysis in progress or ready to navigate
  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <ProjectAnalysisStatus
          uploadState={uploadState}
          onNavigateToDashboard={handleNavigateToDashboard}
        />
      </div>
    );
  }

  // Case 2: Project is active and user didn't ask to upload a new one
  if (currentProject && !showUploadModal) {
    return (
      <IncidentDashboard
        project={currentProject}
        onUploadNewProject={() => setShowUploadModal(true)}
      />
    );
  }

  // Case 3: Landing / Onboarding Screen for the Incident Response Agent
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Landing Section */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-[#111827] via-[#0D1322] to-[#0A0F1C] p-6 sm:p-10 shadow-2xl">
        {/* Glow ambient background circles */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-glow-ai">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AUTONOMOUS CODEBASE INCIDENT RESPONSE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-sans">
            AI Incident Response Agent <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Powered by Hindsight Memory
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
            Upload your software project archive to establish automated microservice monitoring,
            real-time anomaly detection, AI-driven root cause hypotheses, and continuous learning from historical post-mortems.
          </p>

          {/* Quick action buttons & Return if already uploaded */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const uploadElement = document.getElementById('project-upload-section');
                uploadElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-ai flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Project (.zip)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentProject && (
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#151D2E] hover:bg-card border border-border text-gray-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                <span>Return to {currentProject.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Project Upload Section */}
      <div id="project-upload-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-sans">
              Codebase Ingestion & Onboarding
            </h2>
            <p className="text-xs text-gray-400">
              Provide your software repository ZIP to initialize the incident response pipeline
            </p>
          </div>
          {currentProject && (
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-xs font-mono text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <ProjectUpload
          onUploadStarted={() => {}}
          onUploadSuccess={(parsedProject) => {
            // Success callback
          }}
        />
      </div>

      {/* 3. Capabilities & Architectural Pillars */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
          Agent Architectural Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#151D2E] border border-border flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">1. AST Code Analysis</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Scans directory layout, entrypoints, and microservices to map dependencies and failure surface areas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#151D2E] border border-border flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">2. Telemetry Ingress</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hooks real-time logs and metrics from production into the active project monitoring queue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#151D2E] border border-border flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">3. AI Root-Cause War-Room</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Autonomous multi-hop reasoning generates hypotheses, verified runbooks, and mitigation plans.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#151D2E] border border-border flex items-center justify-center text-blue-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">4. Hindsight Memory</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Vector memory stores every resolution outcome so future similar incidents resolve exponentially faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
