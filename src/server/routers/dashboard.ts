import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress, studySessions } from '@/db/schema';
import { eq, count, and, lte, gt, sql, desc, sum } from 'drizzle-orm';

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

    // Words learned = cards reviewed at least once (repetition > 0)
    const [learnedResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), gt(userProgress.repetition, 0)));

    // Overall accuracy from study_sessions
    const [accuracyResult] = await db
      .select({
        totalReviewed: sum(studySessions.cardsReviewed),
        totalCorrect: sum(studySessions.cardsCorrect),
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId));

    const totalReviewed = Number(accuracyResult?.totalReviewed ?? 0);
    const totalCorrect = Number(accuracyResult?.totalCorrect ?? 0);
    const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

    // Today's actual review count from study sessions (fixes misleading totalCards - dueCount)
    const today = new Date().toISOString().slice(0, 10);
    const [todaySession] = await db
      .select({ cardsReviewed: studySessions.cardsReviewed })
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), eq(studySessions.date, today)));

    return {
      totalDecks: deckResult?.count ?? 0,
      totalCards: cardResult?.count ?? 0,
      dueForReview: dueResult?.count ?? 0,
      wordsLearned: learnedResult?.count ?? 0,
      accuracy,
      todayReviewed: todaySession?.cardsReviewed ?? 0,
    };
  }),

  // Recent decks with mastery percentage
  getRecentDecks: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userDecks = await db
      .select({
        id: decks.id,
        title: decks.title,
        description: decks.description,
        createdAt: decks.createdAt,
        cardCount: count(flashcards.id),
      })
      .from(decks)
      .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
      .where(eq(decks.userId, userId))
      .groupBy(decks.id)
      .orderBy(desc(decks.createdAt))
      .limit(3);

    // For each deck, compute mastery % (cards with repetition >= 3)
    const enriched = await Promise.all(
      userDecks.map(async (deck) => {
        if (deck.cardCount === 0) return { ...deck, masteryPercent: 0 };

        const deckCardIds = await db
          .select({ id: flashcards.id })
          .from(flashcards)
          .where(eq(flashcards.deckId, deck.id));

        if (deckCardIds.length === 0) return { ...deck, masteryPercent: 0 };

        const [masteredResult] = await db
          .select({ count: count() })
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, userId),
              gt(userProgress.repetition, 2),
              sql`${userProgress.flashcardId} IN (SELECT id FROM flashcards WHERE deck_id = ${deck.id})`
            )
          );

        const masteryPercent = Math.round(((masteredResult?.count ?? 0) / deck.cardCount) * 100);
        return { ...deck, masteryPercent };
      })
    );

    return enriched;
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
