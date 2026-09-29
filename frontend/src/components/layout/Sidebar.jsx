import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertOctagon,
  Sparkles,
  BrainCircuit,
  BookOpen,
  Settings,
  ShieldCheck,
  User,
  X,
  ChevronRight,
  Flame,
  FolderGit2,
  UploadCloud,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { systemStatus, currentProject, clearCurrentProject } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incidents', icon: AlertOctagon, badge: '4 Crit' },
    { to: '/investigation/INC-1024', label: 'AI Investigation', icon: Sparkles, isAi: true },
    { to: '/memory', label: 'Memory', icon: BrainCircuit },
    { to: '/runbooks', label: 'Runbooks', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border bg-[#090D18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-glow-ai border border-purple-400/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">IR Agent</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Incident Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white lg:hidden rounded"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Monitored Project Status Box */}
        <div className="px-3 pt-3">
          {currentProject ? (
            <div className="p-2.5 rounded-lg bg-[#111827] border border-purple-500/40 shadow-glow-ai">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-purple-300 font-semibold flex items-center gap-1">
                  <FolderGit2 className="w-3 h-3 text-purple-400" />
                  Active Project
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-100 truncate font-sans">
                {currentProject.name}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-1 pt-1 border-t border-gray-800">
                <span>{currentProject.fileCount ?? 0} files</span>
                <button
                  onClick={() => {
                    clearCurrentProject();
                    navigate('/');
                    onClose?.();
                  }}
                  className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
                >
                  Switch
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/');
                onClose?.();
              }}
              className="w-full p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[10px] font-mono font-semibold uppercase flex items-center gap-1">
                  <UploadCloud className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
                  No Codebase Active
                </span>
                <ChevronRight className="w-3 h-3 text-purple-400" />
              </div>
              <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                + Upload Project (.zip)
              </p>
            </button>
          )}
        </div>

        {/* Concept Pill: Remember -> Retrieve -> Resolve -> Learn */}
        <div className="px-4 py-2 mx-3 mt-3 rounded-md bg-[#111827] border border-border/80">
          <div className="text-[10px] font-mono text-purple-300/90 font-medium tracking-wider flex items-center justify-between">
            <span>REMEMBER</span>
            <span>→</span>
            <span>RETRIEVE</span>
            <span>→</span>
            <span>RESOLVE</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider text-center mt-1 pt-1 border-t border-gray-800">
            ★ LEARN & REPEAT
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? item.isAi
                        ? 'bg-purple-950/60 text-purple-200 border border-purple-800/60 shadow-glow-ai'
                        : 'bg-[#151D2E] text-white border border-border-light'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      item.isAi ? 'text-purple-400 group-hover:text-purple-300' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                    {item.badge}
                  </span>
                )}
                {item.isAi && !item.badge && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: System Status & User Profile */}
        <div className="p-3 border-t border-border bg-[#090D18] space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#111827] border border-border">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono text-gray-300">{systemStatus}</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-200 font-semibold text-xs">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">Alex Chen</p>
              <p className="text-[11px] text-gray-400 font-mono truncate">Staff SRE • On-Call</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </aside>
    </>
  );
}
