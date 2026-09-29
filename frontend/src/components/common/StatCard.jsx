import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  trendType = 'neutral', // 'positive', 'negative', 'neutral'
}) {
  const borderVariants = {
    default: 'border-border hover:border-border-light',
    critical: 'border-critical/30 hover:border-critical/50 bg-[#16121b]',
    ai: 'border-ai/40 hover:border-ai/60 bg-[#141224] shadow-glow-ai',
    success: 'border-low/30 hover:border-low/50',
    warning: 'border-medium/30 hover:border-medium/50',
  };

  const iconColors = {
    default: 'text-gray-400 bg-gray-800/60',
    critical: 'text-critical bg-critical/10',
    ai: 'text-ai-light bg-ai/15',
    success: 'text-low bg-low/10',
    warning: 'text-medium bg-medium/10',
  };

  const trendColors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-gray-400',
  };

  return (
    <div
      className={`bg-card rounded-lg p-4 border transition-all duration-200 relative overflow-hidden ${
        borderVariants[variant] || borderVariants.default
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold font-mono text-gray-100 tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium font-mono ${trendColors[trendType]}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${iconColors[variant] || iconColors.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
