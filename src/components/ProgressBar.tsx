'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  height?: string;
  animated?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  colorClass = 'bg-gradient-to-r from-primary to-secondary',
  height = 'h-2',
  animated = true,
  label,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div
        className={`${height} w-full bg-surface-container-high rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full ${colorClass} ${animated ? 'transition-all duration-500' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
