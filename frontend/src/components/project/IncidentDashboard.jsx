import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Flame,
  Clock,
  CheckCircle2,
  Sparkles,
  Activity,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import ProjectHeader from './ProjectHeader';
import StatCard from '../common/StatCard';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { getDashboardStats, getIncidents, getRecentActivity } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function IncidentDashboard({ project, onUploadNewProject }) {
  const navigate = useNavigate();
  const { refreshTrigger, triggerRefresh, addToast } = useApp();

  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, incidentsData, activityData] = await Promise.all([
          getDashboardStats(),
          getIncidents(),
          getRecentActivity(),
        ]);
        setStats(statsData);
        setIncidents(incidentsData);
        setActivities(activityData);
      } catch (err) {
        console.error('Failed to load incident dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const handleRescan = () => {
    triggerRefresh();
    addToast({
      title: 'Codebase Re-scanned',
      message: `Updated telemetry baseline for ${project?.name || 'project'}.`,
      type: 'info',
    });
  };

  // Derive monitored services from project
  const detectedServices = project?.detectedServices || ['Payment Gateway', 'Auth Service', 'API Gateway'];
  const monitoredCount = detectedServices.length;

  // Prioritize active incidents for this project
  const activeIncidents = incidents.slice(0, 5);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-[#151D2E] rounded-xl animate-pulse" />
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Monitored Project Banner Header */}
      <ProjectHeader
        project={project}
        onUploadNewProject={onUploadNewProject}
        onRescan={handleRescan}
      />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents ?? 12}
          subtitle="Awaiting resolution"
          icon={AlertOctagon}
          variant="warning"
        />
        <StatCard
          title="Critical Alerts"
          value={stats?.criticalIncidents ?? 4}
          subtitle="P0/P1 SLA breaches"
          icon={Flame}
          variant="critical"
        />
        <StatCard
          title="Monitored Services"
          value={monitoredCount}
          subtitle="Mapped in codebase"
          icon={Boxes}
          variant="ai"
        />
        <StatCard
          title="Resolved Today"
          value={stats?.resolvedToday ?? 28}
          subtitle="Learnings in memory"
          icon={CheckCircle2}
          variant="success"
          trend="+4 vs yesterday"
          trendType="positive"
        />
        <StatCard
          title="Mean Time To Resolve"
          value={stats?.avgResolutionTime ?? '18m'}
          subtitle="AI-assisted MTTR"
          icon={Clock}
          variant="default"
          trend="-14% vs avg"
          trendType="positive"
        />
      </div>

      {/* 3. Monitored Services Telemetry Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
              Monitored Codebase Services & Real-Time Health
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {detectedServices.map((svcName, idx) => {
            const isDegraded = idx === 0; // First service has active critical incident
            return (
              <div
                key={svcName}
                onClick={() => navigate(`/incidents?search=${encodeURIComponent(svcName)}`)}
                className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                  isDegraded
                    ? 'bg-red-950/20 border-red-800/50 hover:border-red-600'
                    : 'bg-[#151D2E]/60 border-border hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-purple-300 font-mono truncate">
                    {svcName}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      isDegraded
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isDegraded ? '1 ALERT' : 'HEALTHY'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>Latency: {isDegraded ? '480ms (High)' : '24ms'}</span>
                  <span>Uptime: {isDegraded ? '98.4%' : '99.99%'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Grid: Left (Active Incidents Table + Velocity Chart) & Right (AI Agent Insights + Live Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Incidents Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-mono">
                  Active Incidents in {project?.name || 'Project'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151D2E] text-gray-400 border border-border">
                  {activeIncidents.length} prioritized
                </span>
              </div>
              <button
                onClick={() => navigate('/incidents')}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-[#0e1422] text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Incident ID</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Detected</th>
                      <th className="py-3 px-4">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeIncidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="hover:bg-[#151D2E]/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-purple-400 group-hover:text-purple-300">
                          {inc.id}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-200">
                          {inc.service}
                        </td>
                        <td className="py-3 px-4">
                          <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-400 font-mono">
                          {inc.detected}
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono">
                          {inc.assignee || 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Velocity Trend Chart */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
                  Today's Incident Velocity Trend
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Past 6 Hours</span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.timelineTrend || []}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="projResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="projActiveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#4B5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4B5563" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#263247',
                      fontSize: '11px',
                      borderRadius: '6px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#projResolvedGrad)"
                    name="Cumulative Resolved"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#projActiveGrad)"
                    name="Active Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Incident Agent Insight Callout */}
          <div className="bg-[#121626] rounded-xl border border-purple-500/40 p-5 shadow-glow-ai relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-200">
                  AI Agent War-Room
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-mono text-[11px]">Primary incident</span>
                <span className="font-mono font-bold text-red-400">INC-1024 (P1)</span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-gray-400 block">Root cause hypothesis:</span>
                <p className="text-gray-200 font-medium leading-snug mt-0.5">
                  Database connection pool exhausted under write traffic cascade.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1422] border border-purple-900/60 text-[11px] font-mono space-y-1">
                <div className="text-gray-400 flex items-center justify-between">
                  <span>Confidence:</span>
                  <span className="text-emerald-400 font-bold">94%</span>
                </div>
                <div className="text-gray-400 flex items-center justify-between">
                  <span>Runbook match:</span>
                  <span className="text-purple-300">DB-POOL-RECOVERY-01</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => navigate('/investigation/INC-1024')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open AI Investigation Workflow</span>
                </button>
              </div>
            </div>
          </div>

          {/* Codebase Activity Feed */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
                Project Telemetry Feed
              </h3>
              <span className="text-[10px] font-mono text-gray-400">Live</span>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border text-xs">
              {activities.map((act) => (
                <div key={act.id} className="relative">
                  <span
                    className={`absolute -left-5 top-1 w-2 h-2 rounded-full -translate-x-1/2 ${
                      act.badgeColor === 'red'
                        ? 'bg-red-500'
                        : act.badgeColor === 'purple'
                        ? 'bg-purple-400'
                        : act.badgeColor === 'green'
                        ? 'bg-emerald-400'
                        : act.badgeColor === 'orange'
                        ? 'bg-orange-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-200">{act.title}</span>
                      <span className="text-[10px] font-mono text-gray-400">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
