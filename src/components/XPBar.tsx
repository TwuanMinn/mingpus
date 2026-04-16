'use client';

import { trpc } from '@/trpc/client';
import { getLevelInfo, xpForLevel, levelProgress } from '@/lib/gamification';

export function XPBar() {
  const { data: xp } = trpc.getXPStatus.useQuery();

  if (!xp) return null;

  const progress = Math.round(xp.progress * 100);
  const info = xp.levelInfo;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-primary text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {info.icon}
          </span>
          <span className="font-bold text-on-surface uppercase tracking-wider">
            Level {xp.level}
          </span>
        </div>
        <span className="text-on-surface-variant font-medium tabular-nums">
          {xp.totalXP.toLocaleString()} XP
        </span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-on-surface-variant/70">
        <span>{info.title} {info.titleCN}</span>
        <span>{xp.xpToNextLevel - Math.round(xp.progress * xp.xpToNextLevel)} XP to next</span>
      </div>
    </div>
  );
}
