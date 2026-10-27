import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

function CodeBlock({ code = '', language = '', title = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-200/90 shadow-sm">
      <div className="flex items-center justify-between border-b border-base-300/80 bg-base-100/90 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          {language && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-medium text-primary uppercase text-[11px]">
              {language}
            </span>
          )}
          {title && <span className="font-medium text-base-content/75">{title}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
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
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-base-content/90">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
