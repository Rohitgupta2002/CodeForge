import React from 'react';

export function getDifficultyColorConfig(difficulty = '') {
  switch (String(difficulty).toLowerCase()) {
    case 'easy':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        text: 'text-emerald-400'
      };
    case 'medium':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        text: 'text-amber-400'
      };
    case 'hard':
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
        text: 'text-rose-400'
      };
    default:
      return {
        badge: 'bg-base-300 text-base-content/70 border-base-300',
        dot: 'bg-base-content/40',
        text: 'text-base-content/70'
      };
  }
}

export function getDifficultyBadgeColor(difficulty = '') {
  switch (String(difficulty).toLowerCase()) {
    case 'easy':
      return 'badge-success';
    case 'medium':
      return 'badge-warning';
    case 'hard':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

export function getDifficultyTextColor(difficulty = '') {
  return getDifficultyColorConfig(difficulty).text;
}

function DifficultyBadge({ difficulty, size = 'sm', showDot = true }) {
  if (!difficulty) return null;

  const config = getDifficultyColorConfig(difficulty);
  const sizeClasses = size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium capitalize tracking-wide transition-colors ${config.badge} ${sizeClasses}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {difficulty}
    </span>
  );
}

export default DifficultyBadge;
