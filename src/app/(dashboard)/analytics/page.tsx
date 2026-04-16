'use client';

import { trpc } from '@/trpc/client';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ForecastChart } from '@/components/ForecastChart';
import { MasteryMap } from '@/components/MasteryMap';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/Animations';
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
  // Build 365-day grid ending today
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

  // Group into weeks (columns of 7)
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-surface-container-high';
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'bg-primary';
    if (intensity > 0.5) return 'bg-primary/70';
    if (intensity > 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-[700px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-colors`}
                title={`${cell.date}: ${cell.count} reviews`}
              />
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
  const { data: heatmap, isLoading: heatmapLoading } = trpc.getHeatmapData.useQuery();
  const { data: weakest, isLoading: weakestLoading } = trpc.getWeakestCharacters.useQuery();
  const { data: sessions, isLoading: sessionsLoading } = trpc.getSessionHistory.useQuery();
  const { data: recentReviews, isLoading: reviewsLoading } = trpc.getRecentReviews.useQuery();

  const totalSessions = sessions?.length ?? 0;
  const totalReviewed = sessions?.reduce((sum, s) => sum + s.cardsReviewed, 0) ?? 0;
  const totalCorrect = sessions?.reduce((sum, s) => sum + s.cardsCorrect, 0) ?? 0;
  const overallAccuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

  // Accuracy trend (last 7 vs previous 7)
  const recent7 = sessions?.slice(0, 7) ?? [];
  const prev7 = sessions?.slice(7, 14) ?? [];
  const recent7Acc = recent7.reduce((s, r) => s + r.cardsCorrect, 0) / Math.max(1, recent7.reduce((s, r) => s + r.cardsReviewed, 0)) * 100;
  const prev7Acc = prev7.reduce((s, r) => s + r.cardsCorrect, 0) / Math.max(1, prev7.reduce((s, r) => s + r.cardsReviewed, 0)) * 100;
  const accTrend = recent7Acc - prev7Acc;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Learning Insights</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)] leading-tight">Analytics Dashboard</h2>
        </div>
        <Link href="/" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </section>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: 'calendar_today' },
          { label: 'Cards Reviewed', value: totalReviewed.toLocaleString(), icon: 'style' },
          { label: 'Overall Accuracy', value: `${overallAccuracy}%`, icon: 'target' },
          { label: 'Accuracy Trend', value: `${accTrend >= 0 ? '+' : ''}${accTrend.toFixed(1)}%`, icon: accTrend >= 0 ? 'trending_up' : 'trending_down' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">{stat.icon}</span>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{stat.label}</p>
            </div>
            {sessionsLoading ? (
              <div className="h-6 w-16 bg-surface-container-high rounded animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-black text-on-surface">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Study Heatmap */}
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface mb-6">Study Activity</h3>
        {heatmapLoading ? (
          <div className="h-24 bg-surface-container-high rounded animate-pulse" />
        ) : (
          <HeatmapGrid data={heatmap ?? []} />
        )}
      </div>

      {/* Spaced Repetition Forecast */}
      <ForecastChart />

      {/* Character Mastery Map */}
      <MasteryMap />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weakest Characters */}
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
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
                <div key={w.flashcardId} className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <span className="text-xs font-bold text-outline w-5">{i + 1}</span>
                  <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline/40">psychology</span>
              <p className="text-sm text-on-surface-variant mt-2">No review data yet. Start practicing!</p>
            </div>
          )}
        </div>

        {/* Session History */}
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
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
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                      <span className="text-sm font-medium text-on-surface">{s.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-on-surface-variant">{s.cardsReviewed} cards</span>
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${acc >= 80 ? 'bg-primary' : acc >= 50 ? 'bg-secondary' : 'bg-error'}`} style={{ width: `${acc}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${acc >= 80 ? 'text-primary' : acc >= 50 ? 'text-secondary' : 'text-error'}`}>{acc}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline/40">history</span>
              <p className="text-sm text-on-surface-variant mt-2">No sessions recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Review Log */}
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface mb-6">Recent Reviews</h3>
        {reviewsLoading ? (
          <div className="h-24 bg-surface-container-high rounded animate-pulse" />
        ) : recentReviews && recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentReviews.slice(0, 12).map((r, i) => {
              const q = QUALITY_LABELS[r.quality] ?? QUALITY_LABELS[3];
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="chinese-char text-lg font-bold text-on-surface">{r.character}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{r.pinyin}</p>
                    <p className="text-xs text-on-surface-variant truncate">{r.meaning}</p>
                  </div>
                  <span className={`text-xs font-bold ${q.color}`}>{q.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline/40">reviews</span>
            <p className="text-sm text-on-surface-variant mt-2">No reviews recorded yet. Practice to see your history!</p>
          </div>
        )}
      </div>
    </div>
  );
}
