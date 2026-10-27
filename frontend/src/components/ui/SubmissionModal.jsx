import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, AlertTriangle, Clock, HardDrive, Check, Copy } from 'lucide-react';

function SubmissionModal({ isOpen, onClose, submission }) {
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element for focus restoration
    previousActiveElement.current = document.activeElement;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Escape key handler
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !submission) return null;

  const handleCopyCode = async () => {
    if (!submission.code) return;
    try {
      await navigator.clipboard.writeText(submission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const getStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={14} />
            Accepted
          </span>
        );
      case 'wrong':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
            <XCircle size={14} />
            Wrong Answer
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
            <AlertTriangle size={14} />
            Runtime Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-base-300 px-3 py-1 text-xs font-medium text-base-content/70">
            {status}
          </span>
        );
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      {/* Semi-transparent dark backdrop covering the entire viewport */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] my-auto animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-base-300/80 pb-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 id="submission-modal-title" className="text-lg sm:text-xl font-bold text-base-content">
                Submission Code
              </h2>
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary uppercase border border-primary/20">
                {submission.language}
              </span>
            </div>

            {/* Performance & Status Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {getStatusBadge(submission.status)}
              <span className="inline-flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1 font-mono text-base-content/80 border border-base-300/50">
                <Clock size={12} className="text-primary" />
                Runtime: {submission.runtime ? `${submission.runtime}s` : 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1 font-mono text-base-content/80 border border-base-300/50">
                <HardDrive size={12} className="text-secondary" />
                Memory: {formatMemory(submission.memory)}
              </span>
              <span className="rounded-lg bg-base-200 px-2.5 py-1 font-mono text-base-content/80 border border-base-300/50">
                Passed: {submission.testCasesPassed ?? 0}/{submission.testCasesTotal ?? 0}
              </span>
            </div>
          </div>

          {/* Close (X) button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200 shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner if submission had errors */}
        {submission.errorMessage && (
          <div className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error font-mono overflow-x-auto">
            <p className="font-bold font-sans mb-1 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Execution Error:
            </p>
            <pre className="whitespace-pre-wrap">{submission.errorMessage}</pre>
          </div>
        )}

        {/* Code Content Box with Internal Scrolling */}
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between bg-base-200/90 rounded-t-xl px-4 py-2 border border-b-0 border-base-300 text-xs">
            <span className="font-mono text-base-content/60 text-[11px] uppercase">
              {submission.language} Submitted Solution
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn btn-ghost btn-xs gap-1.5 text-base-content/70 hover:text-base-content"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-success" />
                  <span className="text-success font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto rounded-b-xl border border-base-300 bg-slate-950 p-4 max-h-[55vh]">
            <pre className="font-mono text-xs text-slate-100 leading-relaxed overflow-x-auto whitespace-pre">
              <code>{submission.code}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-base-300/70 text-xs text-base-content/50">
          <span className="hidden sm:inline">Press Esc or click outside to dismiss</span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default SubmissionModal;
