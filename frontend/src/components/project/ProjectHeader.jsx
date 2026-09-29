import React from 'react';
import {
  FolderGit2,
  FileArchive,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  Layers,
  Radio,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProjectHeader({
  project,
  onUploadNewProject,
  onRescan,
}) {
  const { environment } = useApp();

  if (!project) return null;

  return (
    <div className="bg-card rounded-xl border border-border/90 p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Project Identity & Monitored Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-glow-ai shrink-0">
            <FolderGit2 className="w-5 h-5 text-purple-400" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-medium text-gray-400">
                MONITORED PROJECT:
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans truncate">
                {project.name}
              </h1>

              {/* Pulsing Active Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ACTIVE MONITORING
              </span>

              {/* Environment badge */}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151D2E] text-gray-300 border border-border">
                {environment}
              </span>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1 text-gray-300">
                <FileArchive className="w-3.5 h-3.5 text-purple-400" />
                <span>{project.fileName}</span>
                {project.fileSize && (
                  <span className="text-gray-400">({project.fileSize})</span>
                )}
              </span>

              <span>•</span>

              <span className="flex items-center gap-1 text-emerald-400">
                <Code2 className="w-3.5 h-3.5" />
                <span>{project.fileCount ?? 0} files detected</span>
              </span>

              {project.primaryLanguage && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{project.primaryLanguage}</span>
                  </span>
                </>
              )}

              {project.detectedServices && project.detectedServices.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-gray-400">
                    {project.detectedServices.length} services indexed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center shrink-0">
          {onRescan && (
            <button
              onClick={onRescan}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#151D2E] hover:bg-card border border-border hover:border-border-light text-gray-300 transition-colors cursor-pointer"
              title="Re-scan and refresh project telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Re-scan Codebase</span>
            </button>
          )}

          <button
            onClick={onUploadNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 shadow-glow-ai transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-300" />
            <span>Switch / Upload Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
