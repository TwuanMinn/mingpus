'use client';

import { trpc } from '@/trpc/client';
import { motion } from 'framer-motion';

export function WeeklyAccuracyChart() {
  const { data, isLoading } = trpc.analytics.getWeeklyAccuracy.useQuery();

  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
        <div className="h-6 w-48 bg-surface-container-high rounded animate-pulse mb-6" />
        <div className="h-40 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  const weeks = data ?? [];
  const maxReviewed = Math.max(1, ...weeks.map(w => w.reviewed));

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-(family-name:--font-jakarta) font-bold text-lg text-on-surface">
          Weekly Accuracy
        </h3>
        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Last 8 weeks</span>
      </div>

      {weeks.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-outline/40">bar_chart</span>
          <p className="text-sm text-on-surface-variant mt-2">No data yet. Start studying!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="flex items-end gap-2 sm:gap-3 h-32">
            {weeks.map((w, i) => {
              const barHeight = Math.max(4, (w.reviewed / maxReviewed) * 100);
              const accColor = w.accuracy >= 80 ? 'from-primary to-secondary' :
                               w.accuracy >= 50 ? 'from-secondary to-amber-500' :
                               'from-error to-rose-500';

              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-medium border border-outline-variant/20">
                    {w.reviewed} reviews · {w.accuracy}%
                  </div>

                  {/* Accuracy label */}
                  <span className="text-[9px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.accuracy}%
                  </span>

                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${barHeight}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                    className={`w-full rounded-t-lg bg-linear-to-t ${accColor} relative overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/10 transition-shadow`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  {/* Week label */}
                  <span className="text-[8px] sm:text-[9px] text-on-surface-variant font-medium mt-1">
                    {formatWeek(w.week)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div className="flex justify-between items-center pt-3 border-t border-outline-variant/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">trending_up</span>
              <span className="text-xs text-on-surface-variant font-medium">
                Avg: <span className="font-bold text-on-surface">
                  {Math.round(weeks.reduce((s, w) => s + w.accuracy, 0) / weeks.length)}%
                </span>
              </span>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              Total: <span className="font-bold text-on-surface">
                {weeks.reduce((s, w) => s + w.reviewed, 0).toLocaleString()} reviews
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
