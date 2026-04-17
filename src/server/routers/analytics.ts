import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { reviewLogs, flashcards, userProgress, studySessions, decks } from '@/db/schema';
import { eq, and, desc, asc, sql, count, avg } from 'drizzle-orm';

export const analyticsRouter = router({
  // Heatmap data: daily review counts for the last 365 days
  getHeatmapData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const data = await db
      .select({
        date: studySessions.date,
        cardsReviewed: studySessions.cardsReviewed,
        cardsCorrect: studySessions.cardsCorrect,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(asc(studySessions.date))
      .limit(365);

    return data;
  }),

  // Weakest characters: lowest e-factor, most "Again" presses
  getWeakestCharacters: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Characters with lowest e-factor (hardest to remember)
    const weakest = await db
      .select({
        flashcardId: userProgress.flashcardId,
        efactor: userProgress.efactor,
        repetition: userProgress.repetition,
        interval: userProgress.interval,
        character: flashcards.character,
        pinyin: flashcards.pinyin,
        meaning: flashcards.meaning,
      })
      .from(userProgress)
      .innerJoin(flashcards, eq(userProgress.flashcardId, flashcards.id))
      .where(eq(userProgress.userId, userId))
      .orderBy(asc(userProgress.efactor))
      .limit(10);

    // Count "again" presses per character from review logs
    const againCounts = await db
      .select({
        flashcardId: reviewLogs.flashcardId,
        againCount: count(),
      })
      .from(reviewLogs)
      .where(and(eq(reviewLogs.userId, userId), sql`${reviewLogs.quality} < 3`))
      .groupBy(reviewLogs.flashcardId)
      .orderBy(desc(count()))
      .limit(10);

    return { weakest, againCounts };
  }),

  // Session history with trends
  getSessionHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const sessions = await db
      .select({
        date: studySessions.date,
        cardsReviewed: studySessions.cardsReviewed,
        cardsCorrect: studySessions.cardsCorrect,
        studyMinutes: studySessions.studyMinutes,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date))
      .limit(30);

    return sessions;
  }),

  // Recent review log entries
  getRecentReviews: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await db
      .select({
        quality: reviewLogs.quality,
        responseTimeMs: reviewLogs.responseTimeMs,
        createdAt: reviewLogs.createdAt,
        character: flashcards.character,
        pinyin: flashcards.pinyin,
        meaning: flashcards.meaning,
      })
      .from(reviewLogs)
      .innerJoin(flashcards, eq(reviewLogs.flashcardId, flashcards.id))
      .where(eq(reviewLogs.userId, userId))
      .orderBy(desc(reviewLogs.createdAt))
      .limit(50);
  }),

  /** HSK progress: learned and mastered counts per HSK level */
  getHSKProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Count cards per HSK level, with mastery status
    const results = await db
      .select({
        hskLevel: flashcards.hskLevel,
        total: count(),
        mastered: sql<number>`SUM(CASE WHEN ${userProgress.repetition} >= 3 THEN 1 ELSE 0 END)`,
      })
      .from(flashcards)
      .innerJoin(decks, eq(flashcards.deckId, decks.id))
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.flashcardId, flashcards.id),
          eq(userProgress.userId, userId),
        ),
      )
      .where(eq(decks.userId, userId))
      .groupBy(flashcards.hskLevel);

    return results.map(r => ({
      hskLevel: r.hskLevel ?? 0,
      learned: r.total,
      mastered: r.mastered ?? 0,
    }));
  }),

  /** Weekly accuracy trend for chart */
  getWeeklyAccuracy: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const sessions = await db
      .select({
        date: studySessions.date,
        cardsReviewed: studySessions.cardsReviewed,
        cardsCorrect: studySessions.cardsCorrect,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date))
      .limit(56); // 8 weeks

    // Group by week
    const weeks: Map<string, { reviewed: number; correct: number }> = new Map();
    for (const s of sessions) {
      const d = new Date(s.date);
      // Get ISO week start (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff)).toISOString().slice(0, 10);

      const existing = weeks.get(weekStart) ?? { reviewed: 0, correct: 0 };
      existing.reviewed += s.cardsReviewed;
      existing.correct += s.cardsCorrect;
      weeks.set(weekStart, existing);
    }

    return Array.from(weeks.entries())
      .map(([week, data]) => ({
        week,
        accuracy: data.reviewed > 0 ? Math.round((data.correct / data.reviewed) * 100) : 0,
        reviewed: data.reviewed,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // last 8 weeks
  }),
});
