import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function EmptyState({
  title = 'No incidents found',
  description = 'No matching records match your filter criteria.',
  icon: Icon = ShieldAlert,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-lg border border-border">
      <div className="p-3 bg-[#151D2E] rounded-full border border-border text-gray-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-gray-200">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
