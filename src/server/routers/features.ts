import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { characterSentences, characterRadicals, userProgress, flashcards, decks, notifications, studySessions } from '@/db/schema';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { generateExampleSentences } from '@/lib/ai-sentences';

export const featuresRouter = router({
  // ─── Sentence Context ───
  getSentences: protectedProcedure
    .input(z.object({ character: z.string() }))
    .query(async ({ input }) => {
      const existing = await db
        .select()
        .from(characterSentences)
        .where(eq(characterSentences.character, input.character))
        .limit(5);

      if (existing.length > 0) return existing;

      // No sentences in DB — auto-generate via Claude (fire-and-forget style:
      // we kick off generation and return empty so the UI can show a "generating" state).
      // The client can poll via generateSentences mutation then refetch.
      return [];
    }),

  /** Generate AI example sentences for a character and persist them. */
  generateSentences: protectedProcedure
    .input(z.object({
      character: z.string().min(1).max(4),
      meaning: z.string(),
      hskLevel: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // Idempotent — skip if already generated
      const existing = await db
        .select({ id: characterSentences.id })
        .from(characterSentences)
        .where(eq(characterSentences.character, input.character))
        .limit(1);

      if (existing.length > 0) {
        return await db
          .select()
          .from(characterSentences)
          .where(eq(characterSentences.character, input.character))
          .limit(5);
      }

      const generated = await generateExampleSentences(input.character, input.meaning, input.hskLevel);

      await db.insert(characterSentences).values(
        generated.map((s) => ({
          character: input.character,
          sentence: s.sentence,
          pinyin: s.pinyin,
          translation: s.translation,
          hskLevel: input.hskLevel ?? null,
        })),
      );

      return await db
        .select()
        .from(characterSentences)
        .where(eq(characterSentences.character, input.character))
        .limit(5);
    }),

  // ─── Radical Breakdown ───
  getRadicals: protectedProcedure
    .input(z.object({ character: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(characterRadicals)
        .where(eq(characterRadicals.character, input.character))
        .limit(1);
      if (result.length === 0) return null;
      let radicals: { radical: string; meaning: string; position: string }[] = [];
      try {
        radicals = JSON.parse(result[0].radicals);
      } catch {
        radicals = [];
      }
      return { ...result[0], radicals };
    }),

  // ─── Character Mastery Map ───
  getMasteryMap: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        flashcardId: flashcards.id,
        character: flashcards.character,
        pinyin: flashcards.pinyin,
        meaning: flashcards.meaning,
        hskLevel: flashcards.hskLevel,
        efactor: userProgress.efactor,
        repetition: userProgress.repetition,
        interval: userProgress.interval,
      })
      .from(flashcards)
      .innerJoin(decks, eq(flashcards.deckId, decks.id))
      .leftJoin(userProgress, and(
        eq(userProgress.flashcardId, flashcards.id),
        eq(userProgress.userId, ctx.session.user.id),
      ))
      .where(eq(decks.userId, ctx.session.user.id));

    return rows.map(r => ({
      ...r,
      mastery: r.repetition === null ? 'new' as const
        : r.repetition >= 5 && (r.efactor ?? 2500) >= 2500 ? 'mastered' as const
        : r.repetition >= 2 ? 'learning' as const
        : 'new' as const,
    }));
  }),

  // ─── Spaced Repetition Forecast (single query, no N+1) ───
  getForecast: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 14);

    // Single query with date grouping instead of 14 sequential queries
    const rows = await db
      .select({
        dueDate: userProgress.dueDate,
      })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, ctx.session.user.id),
        gte(userProgress.dueDate, start),
        lte(userProgress.dueDate, end),
      ));

    // Build a map of date → count
    const countMap = new Map<string, number>();
    for (const row of rows) {
      if (!row.dueDate) continue;
      const dateStr = new Date(row.dueDate).toISOString().slice(0, 10);
      countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
    }

    // Fill 14-day range
    const days: { date: string; count: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
    }

    return days;
  }),

  // ─── Notifications ───
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, ctx.session.user.id),
        eq(notifications.read, false),
      ));
    return result[0]?.count ?? 0;
  }),

  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.session.user.id),
        ));
      return { success: true };
    }),

  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, ctx.session.user.id));
    return { success: true };
  }),

  // ─── Generate Weekly Summary Notification ───
  generateWeeklySummary: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get weekly stats
    const stats = await db
      .select({
        totalReviewed: sql<number>`COALESCE(SUM(cards_reviewed), 0)`,
        totalCorrect: sql<number>`COALESCE(SUM(cards_correct), 0)`,
        sessions: sql<number>`count(*)`,
      })
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        gte(studySessions.createdAt, weekAgo),
      ));

    const s = stats[0];
    const accuracy = s.totalReviewed > 0 ? Math.round((s.totalCorrect / s.totalReviewed) * 100) : 0;

    const message = s.totalReviewed > 0
      ? `This week: ${s.totalReviewed} cards reviewed across ${s.sessions} sessions with ${accuracy}% accuracy. ${accuracy >= 80 ? 'Excellent work! 🎉' : 'Keep practicing! 💪'}`
      : 'No study sessions this week. Jump back in — consistency is key! 📚';

    await db.insert(notifications).values({
      userId,
      title: '📊 Weekly Study Summary',
      message,
      type: 'weekly_summary',
      data: JSON.stringify(s),
    });

    return { success: true, message };
  }),
});
