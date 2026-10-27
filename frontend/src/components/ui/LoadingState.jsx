import React from 'react';
import { Code2 } from 'lucide-react';

function LoadingState({ label = 'Loading...', fullScreen = false }) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-200/80 backdrop-blur-sm'
    : 'flex min-h-[35vh] flex-col items-center justify-center gap-4 text-base-content/70';

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <div className="absolute text-primary animate-pulse-subtle">
          <Code2 size={20} />
        </div>
      </div>
      <p className="text-sm font-medium tracking-wide text-base-content/75">{label}</p>
    </div>
  );
}

export default LoadingState;
