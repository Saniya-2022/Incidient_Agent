import React from 'react';

export default function LoadingSkeleton({ type = 'table', rows = 5 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#151D2E] rounded-lg border border-border" />
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#151D2E] rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-[#151D2E] rounded-lg border border-border" />
            <div className="h-64 bg-[#151D2E] rounded-lg border border-border" />
          </div>
          <div className="space-y-4">
            <div className="h-72 bg-[#151D2E] rounded-lg border border-border" />
            <div className="h-48 bg-[#151D2E] rounded-lg border border-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-[#151D2E] rounded w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-[#151D2E] rounded w-full" />
      ))}
    </div>
  );
}
