import React from 'react';

function StatCard({ title, value, subtext, icon: Icon, progress, color = 'primary' }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/20',
      progress: 'bg-primary'
    },
    success: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
      progress: 'bg-success'
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/20',
      progress: 'bg-warning'
    },
    info: {
      bg: 'bg-info/10',
      text: 'text-info',
      border: 'border-info/20',
      progress: 'bg-info'
    }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className={`surface-card relative overflow-hidden rounded-2xl p-5 ${scheme.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-base-content">{value}</span>
            {subtext && <span className="text-xs text-base-content/50">{subtext}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${scheme.bg} ${scheme.text}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-300">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scheme.progress}`}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-base-content/50">
            <span>Progress</span>
            <span className="font-semibold text-base-content/80">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatCard;
