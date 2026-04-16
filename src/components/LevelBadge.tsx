'use client';

import { trpc } from '@/trpc/client';

export function LevelBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { data: xp } = trpc.getXPStatus.useQuery();

  if (!xp) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  const iconSize = {
    sm: 'text-[14px]',
    md: 'text-[18px]',
    lg: 'text-[24px]',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center text-white shadow-lg shadow-primary/20 relative`}
      title={`${xp.levelInfo.title} ${xp.levelInfo.titleCN} — Level ${xp.level}`}
    >
      <span
        className={`material-symbols-outlined ${iconSize[size]}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {xp.levelInfo.icon}
      </span>
      <span className="font-black leading-none">{xp.level}</span>
    </div>
  );
}
