import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress, studySessions } from '@/db/schema';
import { eq, count, and, lte, gt, sql, desc } from 'drizzle-orm';

export const dashboardRouter = router({
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [deckResult] = await db.select({ count: count() }).from(decks).where(eq(decks.userId, userId));
    const [cardResult] = await db
      .select({ count: count() })
      .from(flashcards)
      .innerJoin(decks, eq(flashcards.deckId, decks.id))
      .where(eq(decks.userId, userId));
    const [dueResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), lte(userProgress.dueDate, new Date())));

    return {
      totalDecks: deckResult?.count ?? 0,
      totalCards: cardResult?.count ?? 0,
      dueForReview: dueResult?.count ?? 0,
    };
  }),

  getStudyStreak: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Count cards that have been reviewed at least once (repetition > 0)
    const [reviewedResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), gt(userProgress.repetition, 0)));

    const totalReviewed = reviewedResult?.count ?? 0;

    // Get recent study sessions ordered by date to compute streak
    const sessions = await db
      .select({ date: studySessions.date, cardsReviewed: studySessions.cardsReviewed })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date))
      .limit(60);

    const today = new Date().toISOString().slice(0, 10);
    const hasStudiedToday = sessions.length > 0 && sessions[0].date === today;

    // Compute consecutive day streak
    let streakDays = 0;
    const dateSet = new Set(sessions.map(s => s.date));
    const current = new Date();

    // If haven't studied today, streak only counts from yesterday
    if (!hasStudiedToday) {
      current.setDate(current.getDate() - 1);
      if (!dateSet.has(current.toISOString().slice(0, 10))) {
        return { totalReviewed, hasStudiedToday, streakDays: 0 };
      }
    }

    for (let i = 0; i < 60; i++) {
      const dateStr = current.toISOString().slice(0, 10);
      if (dateSet.has(dateStr)) {
        streakDays++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalReviewed,
      hasStudiedToday,
      streakDays,
    };
  }),

  // Record or update today's study session
  recordStudyActivity: protectedProcedure
    .input(z.object({
      cardsReviewed: z.number().min(1),
      cardsCorrect: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const today = new Date().toISOString().slice(0, 10);

      // Check if we already have a session for today
      const [existing] = await db
        .select()
        .from(studySessions)
        .where(and(eq(studySessions.userId, userId), eq(studySessions.date, today)));

      if (existing) {
        await db.update(studySessions).set({
          cardsReviewed: existing.cardsReviewed + input.cardsReviewed,
          cardsCorrect: existing.cardsCorrect + input.cardsCorrect,
        }).where(eq(studySessions.id, existing.id));
      } else {
        await db.insert(studySessions).values({
          userId,
          date: today,
          cardsReviewed: input.cardsReviewed,
          cardsCorrect: input.cardsCorrect,
        });
      }

      return { success: true };
    }),
});
