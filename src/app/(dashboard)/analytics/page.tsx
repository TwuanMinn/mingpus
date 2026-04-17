'use client';

import { trpc } from '@/trpc/client';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ForecastChart } from '@/components/ForecastChart';
import { MasteryMap } from '@/components/MasteryMap';
import { HSKProgressTracker } from '@/components/HSKProgress';
import { WeeklyAccuracyChart } from '@/components/WeeklyAccuracyChart';
import { motion } from 'framer-motion';
import Link from 'next/link';

const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Blackout', color: 'text-error' },
  1: { label: 'Again', color: 'text-error' },
  2: { label: 'Hard', color: 'text-on-surface-variant' },
  3: { label: 'Hard', color: 'text-on-surface-variant' },
  4: { label: 'Good', color: 'text-primary' },
  5: { label: 'Easy', color: 'text-secondary' },
};

function HeatmapGrid({ data }: { data: { date: string; cardsReviewed: number }[] }) {
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  const dataMap = new Map(data.map(d => [d.date, d.cardsReviewed]));

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    cells.push({ date: dateStr, count: dataMap.get(dateStr) ?? 0 });
  }

  const maxCount = Math.max(1, ...cells.map(c => c.count));
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-surface-container-high hover:bg-surface-container-highest';
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'bg-primary hover:brightness-110';
    if (intensity > 0.5) return 'bg-primary/70 hover:bg-primary/80';
    if (intensity > 0.25) return 'bg-primary/40 hover:bg-primary/50';
    return 'bg-primary/20 hover:bg-primary/30';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-[700px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-all duration-150 cursor-default group relative`}
                title={`${cell.date}: ${cell.count} reviews`}
              >
                {/* Hover tooltip */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[9px] px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-outline-variant/20 font-medium">
                  {cell.count > 0 ? `${cell.count} reviews` : 'No activity'}
                  <div className="text-[8px] text-on-surface-variant">{cell.date}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-on-surface-variant">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-surface-container-high" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  usePageTitle('Analytics');
  const { data: heatmap, isLoading: heatmapLoading } = trpc.analytics.getHeatmapData.useQuery();
  const { data: weakest, isLoading: weakestLoading } = trpc.analytics.getWeakestCharacters.useQuery();
  const { data: sessions, isLoading: sessionsLoading } = trpc.analytics.getSessionHistory.useQuery();
  const { data: recentReviews, isLoading: reviewsLoading } = trpc.analytics.getRecentReviews.useQuery();

  const totalSessions = sessions?.length ?? 0;
  const totalReviewed = sessions?.reduce((sum, s) => sum + s.cardsReviewed, 0) ?? 0;
  const totalCorrect = sessions?.reduce((sum, s) => sum + s.cardsCorrect, 0) ?? 0;
  const overallAccuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

  const recent7 = sessions?.slice(0, 7) ?? [];
  const prev7 = sessions?.slice(7, 14) ?? [];
  const recent7Acc = recent7.reduce((s, r) => s + r.cardsCorrect, 0) / Math.max(1, recent7.reduce((s, r) => s + r.cardsReviewed, 0)) * 100;
  const prev7Acc = prev7.reduce((s, r) => s + r.cardsCorrect, 0) / Math.max(1, prev7.reduce((s, r) => s + r.cardsReviewed, 0)) * 100;
  const accTrend = recent7Acc - prev7Acc;

  const statCards = [
    { label: 'Total Sessions', value: totalSessions, icon: 'calendar_today', color: 'text-primary' },
    { label: 'Cards Reviewed', value: totalReviewed.toLocaleString(), icon: 'style', color: 'text-secondary' },
    { label: 'Overall Accuracy', value: `${overallAccuracy}%`, icon: 'target', color: 'text-tertiary' },
    { label: 'Accuracy Trend', value: `${accTrend >= 0 ? '+' : ''}${accTrend.toFixed(1)}%`, icon: accTrend >= 0 ? 'trending_up' : 'trending_down', color: accTrend >= 0 ? 'text-primary' : 'text-error' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Learning Insights</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)] leading-tight">Analytics Dashboard</h2>
        </div>
        <Link href="/" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Dashboard
        </Link>
      </section>

      {/* Summary Stats — animated entrance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="bg-surface-container-low p-4 sm:p-5 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined ${stat.color} text-[18px] group-hover:scale-110 transition-transform`}>{stat.icon}</span>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{stat.label}</p>
            </div>
            {sessionsLoading ? (
              <div className="h-6 w-16 bg-surface-container-high rounded animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-black text-on-surface">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Study Heatmap — enhanced with hover states */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface-container-low rounded-2xl p-6 sm:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">Study Activity</h3>
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">365 days</span>
        </div>
        {heatmapLoading ? (
          <div className="h-24 bg-surface-container-high rounded animate-pulse" />
        ) : (
          <HeatmapGrid data={heatmap ?? []} />
        )}
      </motion.div>

      {/* NEW: HSK Progress + Weekly Accuracy side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <HSKProgressTracker />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <WeeklyAccuracyChart />
        </motion.div>
      </div>

      {/* Spaced Repetition Forecast */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <ForecastChart />
      </motion.div>

      {/* Character Mastery Map */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <MasteryMap />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weakest Characters — enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-container-low rounded-2xl p-6 sm:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">Weakest Characters</h3>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Lowest E-Factor</span>
          </div>
          {weakestLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          ) : weakest?.weakest && weakest.weakest.length > 0 ? (
            <div className="space-y-3">
              {weakest.weakest.map((w, i) => (
                <motion.div
                  key={w.flashcardId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-error/20 hover:shadow-sm transition-all group"
                >
                  <span className="text-xs font-bold text-outline w-5">{i + 1}</span>
                  <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-error/15 transition-colors">
                    <span className="chinese-char text-lg font-bold text-on-surface">{w.character}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm">{w.pinyin}</p>
                    <p className="text-xs text-on-surface-variant truncate">{w.meaning}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-error">{(w.efactor / 1000).toFixed(2)}</p>
                    <p className="text-[9px] text-outline">e-factor</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline/40">psychology</span>
              <p className="text-sm text-on-surface-variant mt-2">No review data yet. Start practicing!</p>
            </div>
          )}
        </motion.div>

        {/* Session History — enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-surface-container-low rounded-2xl p-6 sm:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">Session History</h3>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Last 30 days</span>
          </div>
          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s, i) => {
                const acc = s.cardsReviewed > 0 ? Math.round((s.cardsCorrect / s.cardsReviewed) * 100) : 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] group-hover:scale-110 transition-transform">calendar_today</span>
                      <span className="text-sm font-medium text-on-surface">{s.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-on-surface-variant">{s.cardsReviewed} cards</span>
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${acc}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className={`h-full rounded-full ${acc >= 80 ? 'bg-primary' : acc >= 50 ? 'bg-secondary' : 'bg-error'}`}
                        />
                      </div>
                      <span className={`text-xs font-bold ${acc >= 80 ? 'text-primary' : acc >= 50 ? 'text-secondary' : 'text-error'}`}>{acc}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline/40">history</span>
              <p className="text-sm text-on-surface-variant mt-2">No sessions recorded yet.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Review Log — enhanced with animation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface-container-low rounded-2xl p-6 sm:p-8"
      >
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface mb-6">Recent Reviews</h3>
        {reviewsLoading ? (
          <div className="h-24 bg-surface-container-high rounded animate-pulse" />
        ) : recentReviews && recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentReviews.slice(0, 12).map((r, i) => {
              const q = QUALITY_LABELS[r.quality] ?? QUALITY_LABELS[3];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/15 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-fixed transition-colors">
                    <span className="chinese-char text-lg font-bold text-on-surface">{r.character}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{r.pinyin}</p>
                    <p className="text-xs text-on-surface-variant truncate">{r.meaning}</p>
                  </div>
                  <span className={`text-xs font-bold ${q.color}`}>{q.label}</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline/40">reviews</span>
            <p className="text-sm text-on-surface-variant mt-2">No reviews recorded yet. Practice to see your history!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
