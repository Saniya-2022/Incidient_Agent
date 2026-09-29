import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Globe,
  Radio,
  Check,
  ExternalLink,
  Flame,
  FolderGit2,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { environment, setEnvironment, addToast, currentProject, clearCurrentProject } = useApp();
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      title: 'P1 Alert: Payment API 503 Spike',
      time: '10m ago',
      type: 'critical',
      target: '/incidents/INC-1024',
    },
    {
      id: 2,
      title: 'AI Root Cause Hypothesized (94% conf)',
      time: '8m ago',
      type: 'ai',
      target: '/investigation/INC-1024',
    },
    {
      id: 3,
      title: 'P2 Alert: Auth Service JWKS Invalidation',
      time: '24m ago',
      type: 'high',
      target: '/incidents/INC-1023',
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith('INC-')) {
      navigate(`/incidents/${query}`);
    } else {
      navigate(`/incidents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  const handleSelectEnv = (env) => {
    setEnvironment(env);
    setShowEnvDropdown(false);
    addToast({
      title: 'Environment Switched',
      message: `Active context shifted to ${env}.`,
      type: 'info',
    });
  };

  return (
    <header className="h-16 bg-[#0A0F1C] border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile Hamburger & Search */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-card lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents, errors, services (e.g. INC-1024)..."
              className="w-full bg-[#111827] border border-border text-xs rounded-lg pl-9 pr-12 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-sans"
            />
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-[#151D2E] px-1.5 py-0.5 rounded border border-border">
              ↵
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Controls: Project Indicator, Upload Button, Env Selector, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Monitored Project Chip (if active) */}
        {currentProject && (
          <div
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-border hover:border-purple-500/50 cursor-pointer text-xs transition-colors"
            title={`Monitored Project: ${currentProject.name} (${currentProject.fileCount ?? 0} files)`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-gray-200 max-w-[120px] truncate">
              {currentProject.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Prominent Upload Project Button */}
        <button
          onClick={() => {
            clearCurrentProject();
            navigate('/');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold shadow-glow-ai transition-colors cursor-pointer"
          title="Upload or switch codebase project"
        >
          <UploadCloud className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">Upload Project</span>
        </button>

        {/* Environment Selector */}
        <div className="relative">
          <button
            onClick={() => setShowEnvDropdown(!showEnvDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-border hover:border-border-light text-xs font-medium text-gray-200 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">{environment}</span>
            <span className="sm:hidden font-mono">Prod</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showEnvDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-border">
                Select Environment
              </div>
              {APP_CONFIG.environments.map((env) => (
                <button
                  key={env}
                  onClick={() => handleSelectEnv(env)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-gray-200 hover:bg-[#151D2E] transition-colors"
                >
                  <span className="font-mono">{env}</span>
                  {environment === env && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-300 hover:text-white rounded-lg bg-[#111827] border border-border hover:border-border-light relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-border rounded-lg shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Incident Alerts (3)
                </span>
                <span className="text-[10px] font-mono text-purple-400">Live Pager Feed</span>
              </div>
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(item.target);
                    }}
                    className="p-3 hover:bg-[#151D2E] cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <span
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        item.type === 'critical'
                          ? 'bg-red-500'
                          : item.type === 'ai'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200 leading-snug">{item.title}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border bg-[#0e1422] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/incidents');
                  }}
                  className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 w-full"
                >
                  <span>View all incident queues</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AC
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-semibold text-gray-200 block leading-tight">Alex Chen</span>
            <span className="text-[10px] text-emerald-400 font-mono block">● Primary SRE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
