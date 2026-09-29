import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Filter, Plus, ShieldCheck, Zap } from 'lucide-react';
import RunbookCard from '../components/runbooks/RunbookCard';
import RunbookModal from '../components/runbooks/RunbookModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { getRunbooks } from '../services/api';
import { useApp } from '../context/AppContext';

export default function RunbooksPage() {
  const { addToast } = useApp();
  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRunbook, setSelectedRunbook] = useState(null);

  const categories = ['All', 'Database', 'Authentication', 'Payment', 'Streaming', 'Infrastructure'];

  useEffect(() => {
    async function loadRunbooks() {
      setLoading(true);
      try {
        const data = await getRunbooks({
          search: searchQuery,
          category: categoryFilter,
        });
        setRunbooks(data);
      } catch (err) {
        console.error('Failed to load runbooks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRunbooks();
  }, [searchQuery, categoryFilter]);

  const handleCreateNew = () => {
    addToast({
      title: 'Runbook Creator',
      message: 'New SOP template initialized. Connect with FastAPI backend to persist custom runbooks.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              Runbooks
            </h1>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              Verified SOP Catalog
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Standard operating procedures and automated remediation workflows for production outages.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-glow-ai transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New SOP Runbook</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search runbook title, ID, or command..."
              className="w-full bg-[#151D2E] border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white font-medium shadow-sm'
                    : 'bg-[#151D2E] text-gray-400 hover:text-white border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Runbook Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" />
      ) : runbooks.length === 0 ? (
        <EmptyState
          title="No runbooks found"
          description="Try searching with different keywords or switch categories."
          actionLabel="View All Runbooks"
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runbooks.map((rb) => (
            <RunbookCard
              key={rb.id}
              runbook={rb}
              onView={(r) => setSelectedRunbook(r)}
            />
          ))}
        </div>
      )}

      {/* Runbook Interactive Modal */}
      <RunbookModal
        isOpen={!!selectedRunbook}
        onClose={() => setSelectedRunbook(null)}
        runbook={selectedRunbook}
      />
    </div>
  );
}
