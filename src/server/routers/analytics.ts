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
});
