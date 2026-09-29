import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  Sparkles,
  Layers,
  Code2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  Activity,
  Boxes,
} from 'lucide-react';

export default function ProjectAnalysisStatus({
  uploadState,
  onNavigateToDashboard,
}) {
  const { status, progress, projectData } = uploadState;
  const [countdown, setCountdown] = useState(3);

  // Define the 3-step progress flow
  const steps = [
    {
      id: 'uploading',
      title: 'Uploading',
      subtitle: 'Transferring ZIP archive',
      icon: UploadCloud,
    },
    {
      id: 'analyzing',
      title: 'Analyzing Project',
      subtitle: 'Scanning AST & services',
      icon: Cpu,
    },
    {
      id: 'ready',
      title: 'Ready',
      subtitle: 'Monitoring active',
      icon: CheckCircle2,
    },
  ];

  // Helper to determine step state: 'completed', 'active', 'pending'
  const getStepState = (stepId) => {
    if (status === 'ready') return 'completed';
    if (status === 'analyzing') {
      if (stepId === 'uploading') return 'completed';
      if (stepId === 'analyzing') return 'active';
      return 'pending';
    }
    if (status === 'uploading') {
      if (stepId === 'uploading') return 'active';
      return 'pending';
    }
    return 'pending';
  };

  // Auto-redirect countdown when status becomes 'ready'
  useEffect(() => {
    if (status !== 'ready') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onNavigateToDashboard) {
            onNavigateToDashboard();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onNavigateToDashboard]);

  const projectName = projectData?.name || 'Codebase Project';
  const fileName = projectData?.fileName || 'archive.zip';
  const uploadStatusText =
    status === 'uploading'
      ? `Uploading (${progress}%)`
      : projectData?.uploadStatus || 'Uploaded';
  const analysisStatusText =
    status === 'ready'
      ? 'Analysis Complete'
      : status === 'analyzing'
      ? 'Scanning Codebase & Topology...'
      : 'Queued';

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 animate-in fade-in duration-300">
      {/* Top Banner: Project Details Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400 shrink-0 shadow-glow-ai">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                {projectName}
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                  status === 'ready'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-purple-950/80 text-purple-300 border-purple-800/60 animate-pulse'
                }`}
              >
                {status === 'ready' ? 'READY FOR MONITORING' : 'ANALYZING CODEBASE'}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
              <span>Source File: {fileName}</span>
              {projectData?.fileSize && (
                <>
                  <span>•</span>
                  <span>Size: {projectData.fileSize}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Button: Jump to Dashboard */}
        {status === 'ready' && (
          <button
            onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-ai transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Open Incident Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Flow: Uploading → Analyzing Project → Ready */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Onboarding Pipeline Progress
          </span>
          <span className="text-xs font-mono text-purple-400 font-bold">
            {progress}% Complete
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2 bg-[#151D2E] rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 transition-all duration-300 shadow-glow-ai"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 3 Steps Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {steps.map((step, idx) => {
            const stepState = getStepState(step.id);
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div
                key={step.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  stepState === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : stepState === 'active'
                    ? 'bg-purple-950/30 border-purple-500/50 shadow-glow-ai text-purple-200'
                    : 'bg-[#111827] border-border text-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      stepState === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : stepState === 'active'
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-[#151D2E] text-gray-500 border border-border'
                    }`}
                  >
                    {stepState === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide">
                        {step.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase">
                        {stepState === 'completed'
                          ? 'Done'
                          : stepState === 'active'
                          ? 'In Progress'
                          : 'Waiting'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Extracted Codebase Metadata Cards (No Fake Data!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Upload Status Card */}
        <div className="p-3.5 rounded-lg bg-[#0e1422] border border-border">
          <div className="text-[10px] font-mono uppercase text-gray-400 mb-1 flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            Upload Status
          </div>
          <div className="text-xs font-semibold text-gray-200 font-mono">
            {uploadStatusText}
          </div>
        </div>

        {/* Analysis Status Card */}
        <div className="p-3.5 rounded-lg bg-[#0e1422] border border-border">
          <div className="text-[10px] font-mono uppercase text-gray-400 mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Analysis Status
          </div>
          <div className="text-xs font-semibold text-purple-300 font-mono truncate">
            {analysisStatusText}
          </div>
        </div>

        {/* Detected Files Count Card */}
        <div className="p-3.5 rounded-lg bg-[#0e1422] border border-border">
          <div className="text-[10px] font-mono uppercase text-gray-400 mb-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            Files Detected
          </div>
          <div className="text-xs font-semibold text-emerald-400 font-mono">
            {projectData?.fileCount != null
              ? `${projectData.fileCount} files`
              : 'Detecting...'}
          </div>
        </div>

        {/* Primary Stack Card */}
        <div className="p-3.5 rounded-lg bg-[#0e1422] border border-border">
          <div className="text-[10px] font-mono uppercase text-gray-400 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Primary Stack
          </div>
          <div className="text-xs font-semibold text-indigo-300 font-mono truncate">
            {projectData?.primaryLanguage || 'JavaScript'}
          </div>
        </div>
      </div>

      {/* Detected Services & Modules in Uploaded Project */}
      {projectData?.detectedServices && projectData.detectedServices.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0e1422] border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-gray-200 uppercase font-mono tracking-wider">
                Services Identified for Monitoring ({projectData.detectedServices.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Telemetry Hooks Active
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {projectData.detectedServices.map((svc) => (
              <span
                key={svc}
                className="text-xs font-mono px-2.5 py-1 rounded bg-[#151D2E] text-gray-200 border border-border flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Extracted Files List Preview */}
      {projectData?.sampleFiles && projectData.sampleFiles.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0e1422] border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-300 font-mono">
                Extracted File Structure (Sample)
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {projectData.sampleFiles.length} of {projectData.fileCount} shown
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1 bg-[#090D18] p-3 rounded-lg border border-border/60">
            {projectData.sampleFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 truncate">
                <span className="text-purple-400">📄</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-redirect footer alert */}
      {status === 'ready' && (
        <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              All services ready. Redirecting to Incident Dashboard in{' '}
              <strong className="text-white font-mono">{countdown}s</strong>...
            </span>
          </div>
          <button
            onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
            className="text-xs font-semibold text-purple-300 hover:text-white underline font-mono cursor-pointer"
          >
            Launch Now →
          </button>
        </div>
      )}
    </div>
  );
}
