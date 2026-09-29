import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileArchive,
  Sparkles,
  AlertCircle,
  FolderGit2,
  Layers,
  ArrowRight,
  Shield,
  Cpu,
} from 'lucide-react';
import { uploadProjectArchive } from '../../services/api';
import { createDemoProjectZip } from '../../utils/sampleZipGenerator';
import { useApp } from '../../context/AppContext';

export default function ProjectUpload({ onUploadSuccess, onUploadStarted }) {
  const { addToast, setUploadState } = useApp();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate and stage file
  const handleFileSelect = (file) => {
    setErrorMessage('');
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      const err = 'Please upload a valid ZIP archive (.zip) containing your codebase.';
      setErrorMessage(err);
      addToast({
        title: 'Invalid File Type',
        message: err,
        type: 'critical',
      });
      return;
    }

    setSelectedFile(file);
    // Suggest project name from file name if not already typed
    if (!projectName.trim()) {
      const cleanName = file.name
        .replace(/\.zip$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setProjectName(cleanName);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Trigger file upload and analysis flow
  const handleStartUpload = async (fileToUpload = selectedFile, customName = projectName) => {
    if (!fileToUpload) {
      setErrorMessage('Please choose or drop a ZIP archive first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Set initial upload state in AppContext
    setUploadState({
      status: 'uploading',
      progress: 15,
      projectData: {
        name: customName || fileToUpload.name.replace(/\.zip$/i, ''),
        fileName: fileToUpload.name,
        fileSizeBytes: fileToUpload.size,
        uploadStatus: 'Uploading',
        analysisStatus: 'Pending',
        fileCount: null,
      },
      error: null,
    });

    if (onUploadStarted) {
      onUploadStarted();
    }

    try {
      // Simulate/stream progress for responsive visual feedback
      let simulatedProgress = 20;
      const progressTimer = setInterval(() => {
        simulatedProgress = Math.min(simulatedProgress + 15, 90);
        setUploadState((prev) => ({
          ...prev,
          progress: simulatedProgress,
          projectData: {
            ...prev.projectData,
            uploadStatus: simulatedProgress < 90 ? 'Uploading' : 'Finalizing Upload',
          },
        }));
      }, 150);

      // Perform real upload / real zip parsing
      const projectResult = await uploadProjectArchive(
        fileToUpload,
        customName,
        (progress) => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.max(progress, prev.progress),
          }));
        }
      );

      clearInterval(progressTimer);

      // Step 2: Transition to 'analyzing'
      setUploadState({
        status: 'analyzing',
        progress: 95,
        projectData: {
          ...projectResult,
          uploadStatus: 'Uploaded',
          analysisStatus: 'Analyzing Codebase',
        },
        error: null,
      });

      // Allow a brief moment for analysis visualization
      setTimeout(() => {
        const finalProject = {
          ...projectResult,
          uploadStatus: 'Uploaded',
          analysisStatus: 'Ready',
        };

        setUploadState({
          status: 'ready',
          progress: 100,
          projectData: finalProject,
          error: null,
        });

        addToast({
          title: 'Project Onboarded',
          message: `${finalProject.name} analyzed (${finalProject.fileCount} files detected).`,
          type: 'success',
        });

        if (onUploadSuccess) {
          onUploadSuccess(finalProject);
        }
      }, 1400);
    } catch (err) {
      console.error('Failed to upload/analyze project:', err);
      const msg = err.message || 'Failed to process project archive';
      setErrorMessage(msg);
      setUploadState({
        status: 'error',
        progress: 0,
        projectData: null,
        error: msg,
      });
      addToast({
        title: 'Upload Failed',
        message: msg,
        type: 'critical',
      });
      setIsProcessing(false);
    }
  };

  // Helper for instant hackathon demoing with real generated zip
  const handleLoadDemoProject = async () => {
    try {
      setIsProcessing(true);
      const demoZip = await createDemoProjectZip('Payflow-Microservices');
      setSelectedFile(demoZip);
      setProjectName('Payflow Microservices Core');
      await handleStartUpload(demoZip, 'Payflow Microservices Core');
    } catch (e) {
      console.error('Demo zip generation error:', e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xl transition-all">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-border bg-[#0e1422] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Onboard Software Project
            </h2>
            <p className="text-[11px] text-gray-400">
              Upload your codebase archive to activate AI incident monitoring
            </p>
          </div>
        </div>

        {/* Format pill */}
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#151D2E] text-purple-300 border border-purple-800/40">
          ZIP ARCHIVE ONLY
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Drag and Drop Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-purple-400 bg-purple-950/30 shadow-glow-ai scale-[1.01]'
              : selectedFile
              ? 'border-emerald-500/60 bg-emerald-950/10'
              : 'border-border hover:border-purple-500/60 hover:bg-[#151D2E]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-purple-600 text-white shadow-glow-ai scale-110'
                  : selectedFile
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#151D2E] text-purple-400 group-hover:scale-105 border border-border-light'
              }`}
            >
              {selectedFile ? (
                <FileArchive className="w-7 h-7 text-emerald-400 animate-bounce" />
              ) : (
                <UploadCloud className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
              )}
            </div>

            <div>
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-emerald-300 font-mono">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Click or drag another ZIP archive to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-200">
                    <span className="text-purple-400 font-semibold group-hover:underline">
                      Click to choose project archive
                    </span>{' '}
                    or drag & drop here
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports any repository, backend, or full-stack software ZIP package
                  </p>
                </div>
              )}
            </div>

            {/* Quick feature tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[10px] font-mono text-gray-400 bg-[#0e1422] px-2.5 py-1 rounded border border-border flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                AST Code Parsing
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-[#0e1422] px-2.5 py-1 rounded border border-border flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Service Topology
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-[#0e1422] px-2.5 py-1 rounded border border-border flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Zero Secret Storage
              </span>
            </div>
          </div>
        </div>

        {/* Error Callout if any */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Project Configuration inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono uppercase tracking-wider">
              Project Identifier / Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Payments-Microservice"
              className="w-full bg-[#111827] border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 font-sans transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono uppercase tracking-wider">
              Target Environment
            </label>
            <select
              defaultValue="Production"
              className="w-full bg-[#111827] border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg px-3.5 py-2 text-xs text-gray-100 font-sans transition-colors cursor-pointer"
            >
              <option value="Production">Production Cluster (High Priority)</option>
              <option value="Staging">Staging & Pre-Release</option>
              <option value="Dev-Cluster">Development Sandbox</option>
            </select>
          </div>
        </div>

        {/* Action Controls: Prominent Upload Button & Demo Helper */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
          {/* Hackathon quick demo button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleLoadDemoProject}
            className="w-full sm:w-auto text-xs text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 rounded-lg px-3.5 py-2 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            title="Instant demo: Generates a realistic microservices ZIP in memory and runs analysis"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Try Sample Microservices Project (.zip)</span>
          </button>

          {/* Prominent Upload & Start Analysis Button */}
          <button
            type="button"
            disabled={!selectedFile || isProcessing}
            onClick={() => handleStartUpload()}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all shadow-md ${
              selectedFile && !isProcessing
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-ai cursor-pointer active:scale-95'
                : 'bg-[#151D2E] text-gray-500 border border-border cursor-not-allowed'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Project...' : 'Upload & Analyze Project'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
