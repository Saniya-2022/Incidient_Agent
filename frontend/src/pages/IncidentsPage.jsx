import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import IncidentTable from '../components/incident/IncidentTable';
import { getIncidents } from '../services/api';
import { useApp } from '../context/AppContext';

export default function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshTrigger } = useApp();

  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  const services = [
    'All',
    'Payment API',
    'Auth Service',
    'Order Service',
    'Catalog',
    'Notification Gateway',
    'Billing Service',
    'User Service',
    'Ingress Gateway',
  ];

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Open', 'Investigating', 'Resolved'];

  useEffect(() => {
    // If URL query changes
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchIncidents() {
      setIsLoading(true);
      try {
        const data = await getIncidents({
          search: searchQuery,
          severity: severityFilter,
          status: statusFilter,
          service: serviceFilter,
        });
        setIncidents(data);
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIncidents();
  }, [searchQuery, severityFilter, statusFilter, serviceFilter, refreshTrigger]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('All');
    setStatusFilter('All');
    setServiceFilter('All');
    setSearchParams({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Incidents
            </h1>
            <span className="text-xs font-mono text-purple-400 bg-[#151D2E] px-2 py-0.5 rounded border border-border">
              {incidents.length} recorded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track, triage and investigate production incidents across all clusters.
          </p>
        </div>
      </div>

      {/* Top Filter Controls */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents or errors..."
              className="w-full bg-[#151D2E] border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          {/* Quick Clear Filter Button */}
          {(searchQuery || severityFilter !== 'All' || statusFilter !== 'All' || serviceFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white bg-[#151D2E] hover:bg-card border border-border rounded-lg transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/70 text-xs">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Severity:
            </span>
            <div className="flex items-center gap-1 bg-[#0e1422] p-0.5 rounded-lg border border-border">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                    severityFilter === sev
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Status:
            </span>
            <div className="flex items-center gap-1 bg-[#0e1422] p-0.5 rounded-lg border border-border">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Service Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
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
        </div>
      </div>

      {/* Main Incident Table */}
      <IncidentTable
        incidents={incidents}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
