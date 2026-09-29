import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BrainCircuit,
  Search,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Database,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import SeverityBadge from '../components/common/SeverityBadge';
import MemoryDetailDrawer from '../components/memory/MemoryDetailDrawer';
import RunbookModal from '../components/runbooks/RunbookModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { getMemoryItems, getRunbook } from '../services/api';
import { useApp } from '../context/AppContext';

export default function MemoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshTrigger } = useApp();

  const [memoryItems, setMemoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRunbook, setSelectedRunbook] = useState(null);

  const services = ['All', 'Payment API', 'Auth Service', 'Order Service', 'Catalog', 'Billing Service'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadMemory() {
      setLoading(true);
      try {
        const items = await getMemoryItems({
          search: searchQuery,
          service: serviceFilter,
          severity: severityFilter,
        });
        setMemoryItems(items);
      } catch (err) {
        console.error('Failed to load memory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMemory();
  }, [searchQuery, serviceFilter, severityFilter, refreshTrigger]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setServiceFilter('All');
    setSeverityFilter('All');
    setSearchParams({});
  };

  const handleOpenRunbook = async (runbookId) => {
    try {
      const rb = await getRunbook(runbookId);
      setSelectedRunbook(rb);
    } catch (err) {
      console.error('Error fetching runbook:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
              Hindsight Memory
            </h1>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              Vector RAG Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Search historical incidents, resolutions and lessons learned.
          </p>
        </div>
      </div>

      {/* Memory Top Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Past Incidents"
          value="1,248"
          subtitle="Indexed in vector space"
          icon={Database}
          variant="ai"
        />
        <StatCard
          title="Resolved Incidents"
          value="1,132"
          subtitle="90.7% resolution rate"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Known Root Causes"
          value="387"
          subtitle="Categorized failure patterns"
          icon={BrainCircuit}
          variant="default"
        />
        <StatCard
          title="Runbooks"
          value="86"
          subtitle="Verified mitigation SOPs"
          icon={BookOpen}
          variant="default"
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents, errors, services, root causes..."
              className="w-full bg-[#151D2E] border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          {(searchQuery || serviceFilter !== 'All' || severityFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white bg-[#151D2E] hover:bg-card border border-border rounded-lg transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/70 text-xs">
          {/* Service */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Service:
            </span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-[#151D2E] border border-border rounded px-2.5 py-1 text-xs font-mono text-gray-200 focus:outline-none focus:border-purple-500"
            >
              {services.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Severity:
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#151D2E] border border-border rounded px-2.5 py-1 text-xs font-mono text-gray-200 focus:outline-none focus:border-purple-500"
            >
              {severities.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memory Table */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : memoryItems.length === 0 ? (
        <EmptyState
          title="No memory items found"
          description="Try broadening your search query or reset the service filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-[#0e1422] text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Root Cause</th>
                  <th className="py-3 px-4">Resolution</th>
                  <th className="py-3 px-4">Similarity</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {memoryItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-[#151D2E]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-purple-400 group-hover:text-purple-300">
                      {item.incidentId || item.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-200">
                      <span className="px-2 py-0.5 rounded bg-[#151D2E] border border-border text-[11px]">
                        {item.service}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-200 max-w-xs truncate font-mono">
                      {item.rootCause}
                    </td>
                    <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                      {item.resolution}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {item.similarity}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300"
                      >
                        <span>Post-Mortem</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-[#0e1422] border-t border-border flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Indexed in Hindsight Memory • {memoryItems.length} records</span>
            <span>Embedding: Active</span>
          </div>
        </div>
      )}

      {/* Memory Detail Drawer */}
      <MemoryDetailDrawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        memoryItem={selectedItem}
        onViewRunbook={handleOpenRunbook}
      />

      {/* Runbook Modal */}
      <RunbookModal
        isOpen={!!selectedRunbook}
        onClose={() => setSelectedRunbook(null)}
        runbook={selectedRunbook}
      />
    </div>
  );
}
