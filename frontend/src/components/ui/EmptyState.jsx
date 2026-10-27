import React from 'react';

function EmptyState({ title, description, icon: Icon, actionLabel, onAction }) {
  return (
    <div className="surface-card rounded-2xl border border-dashed border-base-300 px-6 py-12 text-center animate-fade-in">
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-base-content">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-base-content/65">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-outline btn-sm mt-5 border-base-300 hover:border-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
