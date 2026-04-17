import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress, studySessions, userXP } from '@/db/schema';
import { eq, count, and, lte, gt, sql, desc, sum, asc } from 'drizzle-orm';
import { levelFromXP, levelProgress, xpForLevel, getLevelInfo } from '@/lib/gamification';

export const dashboardRouter = router({
  /**
   * Single combined overview query — replaces 5 separate client-side queries
   * (stats, streak, recent decks, due cards, XP status). All DB work runs in
   * parallel; one JSON envelope instead of five.
   */
  getOverview: protectedProcedure
    .input(z.object({ dueCardsLimit: z.number().min(1).max(50).default(3) }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.dueCardsLimit ?? 3;
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();

      const [
        deckResult,
        cardResult,
        dueResult,
        learnedResult,
        accuracyResult,
        todaySession,
        recentDecks,
        recentSessions,
        dueCards,
        xpRows,
      ] = await Promise.all([
        db.select({ count: count() }).from(decks).where(eq(decks.userId, userId)),
        db
          .select({ count: count() })
          .from(flashcards)
          .innerJoin(decks, eq(flashcards.deckId, decks.id))
          .where(eq(decks.userId, userId)),
        db
          .select({ count: count() })
          .from(userProgress)
          .where(and(eq(userProgress.userId, userId), lte(userProgress.dueDate, now))),
        db
          .select({ count: count() })
          .from(userProgress)
          .where(and(eq(userProgress.userId, userId), gt(userProgress.repetition, 0))),
        db
          .select({
            totalReviewed: sum(studySessions.cardsReviewed),
            totalCorrect: sum(studySessions.cardsCorrect),
          })
          .from(studySessions)
          .where(eq(studySessions.userId, userId)),
        db
          .select({ cardsReviewed: studySessions.cardsReviewed })
          .from(studySessions)
          .where(and(eq(studySessions.userId, userId), eq(studySessions.date, today))),
        db
          .select({
            id: decks.id,
            title: decks.title,
            description: decks.description,
            createdAt: decks.createdAt,
            cardCount: sql<number>`COUNT(DISTINCT ${flashcards.id})`,
            masteredCount: sql<number>`COUNT(DISTINCT CASE WHEN ${userProgress.repetition} > 2 THEN ${userProgress.flashcardId} END)`,
          })
          .from(decks)
          .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
          .leftJoin(
            userProgress,
            and(eq(userProgress.flashcardId, flashcards.id), eq(userProgress.userId, userId))
          )
          .where(eq(decks.userId, userId))
          .groupBy(decks.id)
          .orderBy(desc(decks.createdAt))
          .limit(3),
        db
          .select({ date: studySessions.date, cardsReviewed: studySessions.cardsReviewed })
          .from(studySessions)
          .where(eq(studySessions.userId, userId))
          .orderBy(desc(studySessions.date))
          .limit(60),
        db
          .select({
            progressId: userProgress.id,
            flashcardId: userProgress.flashcardId,
            interval: userProgress.interval,
            repetition: userProgress.repetition,
            efactor: userProgress.efactor,
            fsrsStability: userProgress.fsrsStability,
            fsrsDifficulty: userProgress.fsrsDifficulty,
            character: flashcards.character,
            pinyin: flashcards.pinyin,
            meaning: flashcards.meaning,
            strokes: flashcards.strokes,
            hskLevel: flashcards.hskLevel,
          })
          .from(userProgress)
          .innerJoin(flashcards, eq(userProgress.flashcardId, flashcards.id))
          .where(and(eq(userProgress.userId, userId), lte(userProgress.dueDate, now)))
          .orderBy(asc(userProgress.dueDate))
          .limit(limit),
        db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1),
      ]);

      // Stats
      const totalReviewed = Number(accuracyResult[0]?.totalReviewed ?? 0);
      const totalCorrect = Number(accuracyResult[0]?.totalCorrect ?? 0);
      const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

      const stats = {
        totalDecks: deckResult[0]?.count ?? 0,
        totalCards: cardResult[0]?.count ?? 0,
        dueForReview: dueResult[0]?.count ?? 0,
        wordsLearned: learnedResult[0]?.count ?? 0,
        accuracy,
        todayReviewed: todaySession[0]?.cardsReviewed ?? 0,
      };

      // Streak
      const totalReviewedProgress = learnedResult[0]?.count ?? 0;
      const hasStudiedToday = recentSessions.length > 0 && recentSessions[0].date === today;
      const dateSet = new Set(recentSessions.map((s) => s.date));
      let streakDays = 0;
      const cursor = new Date();
      if (!hasStudiedToday) cursor.setDate(cursor.getDate() - 1);
      if (hasStudiedToday || dateSet.has(cursor.toISOString().slice(0, 10))) {
        for (let i = 0; i < 60; i++) {
          if (dateSet.has(cursor.toISOString().slice(0, 10))) {
            streakDays++;
            cursor.setDate(cursor.getDate() - 1);
          } else break;
        }
      }
      const streak = { totalReviewed: totalReviewedProgress, hasStudiedToday, streakDays };

      // Recent decks
      const recent = recentDecks.map((r) => {
        const cardCount = Number(r.cardCount);
        const masteredCount = Number(r.masteredCount);
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          createdAt: r.createdAt,
          cardCount,
          masteryPercent: cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0,
        };
      });

      // XP — initialize on miss (kept out of the parallel block to avoid a race)
      let xp;
      if (xpRows.length === 0) {
        await db.insert(userXP).values({ userId, totalXP: 0, level: 1 });
        xp = {
          totalXP: 0,
          level: 1,
          progress: 0,
          xpToNextLevel: xpForLevel(1),
          levelInfo: getLevelInfo(1),
          currentStreak: 0,
          longestStreak: 0,
        };
      } else {
        const row = xpRows[0];
        const level = levelFromXP(row.totalXP);
        xp = {
          totalXP: row.totalXP,
          level,
          progress: levelProgress(row.totalXP),
          xpToNextLevel: xpForLevel(level),
          levelInfo: getLevelInfo(level),
          currentStreak: row.currentStreak,
          longestStreak: row.longestStreak,
        };
      }

      return { stats, streak, recentDecks: recent, dueCards, xp };
    }),

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

  // Recent decks with mastery percentage — single-query, no N+1
  getRecentDecks: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const rows = await db
      .select({
        id: decks.id,
        title: decks.title,
        description: decks.description,
        createdAt: decks.createdAt,
        cardCount: sql<number>`COUNT(DISTINCT ${flashcards.id})`,
        masteredCount: sql<number>`COUNT(DISTINCT CASE WHEN ${userProgress.repetition} > 2 THEN ${userProgress.flashcardId} END)`,
      })
      .from(decks)
      .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
      .leftJoin(
        userProgress,
        and(eq(userProgress.flashcardId, flashcards.id), eq(userProgress.userId, userId))
      )
      .where(eq(decks.userId, userId))
      .groupBy(decks.id)
      .orderBy(desc(decks.createdAt))
      .limit(3);

    return rows.map((r) => {
      const cardCount = Number(r.cardCount);
      const masteredCount = Number(r.masteredCount);
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        createdAt: r.createdAt,
        cardCount,
        masteryPercent: cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0,
      };
    });
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

  // Record or update today's study session — atomic UPSERT, race-safe
  recordStudyActivity: protectedProcedure
    .input(z.object({
      cardsReviewed: z.number().min(1),
      cardsCorrect: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const today = new Date().toISOString().slice(0, 10);

      await db
        .insert(studySessions)
        .values({
          userId,
          date: today,
          cardsReviewed: input.cardsReviewed,
          cardsCorrect: input.cardsCorrect,
        })
        .onConflictDoUpdate({
          target: [studySessions.userId, studySessions.date],
          set: {
            cardsReviewed: sql`${studySessions.cardsReviewed} + ${input.cardsReviewed}`,
            cardsCorrect: sql`${studySessions.cardsCorrect} + ${input.cardsCorrect}`,
          },
        });

      return { success: true };
    }),
});
