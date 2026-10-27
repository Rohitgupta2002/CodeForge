import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

function ErrorState({ message = 'Something went wrong', onRetry, title = 'An error occurred' }) {
  return (
    <div className="surface-card my-4 rounded-2xl border border-error/30 bg-error/5 p-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/15 text-error">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-error">{title}</h4>
            <p className="mt-0.5 text-xs text-base-content/80 leading-relaxed">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm btn-outline border-error/40 text-error hover:bg-error hover:text-white shrink-0 gap-1.5"
            onClick={onRetry}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
