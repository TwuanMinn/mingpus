import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress } from '@/db/schema';
import { eq, count, and, inArray, sql } from 'drizzle-orm';

export const deckRouter = router({
  getDecks: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();

    const rows = await db
      .select({
        id: decks.id,
        userId: decks.userId,
        title: decks.title,
        description: decks.description,
        createdAt: decks.createdAt,
        cardCount: count(flashcards.id),
        // Count cards where user has a progress row with dueDate <= now
        dueCount: sql<number>`COALESCE(SUM(CASE WHEN ${userProgress.dueDate} IS NOT NULL AND ${userProgress.dueDate} <= ${Math.floor(now.getTime() / 1000)} THEN 1 ELSE 0 END), 0)`.as('due_count'),
        // Count cards where user has NO progress row (never reviewed)
        newCount: sql<number>`COALESCE(SUM(CASE WHEN ${userProgress.id} IS NULL THEN 1 ELSE 0 END), 0)`.as('new_count'),
      })
      .from(decks)
      .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.flashcardId, flashcards.id),
          eq(userProgress.userId, userId),
        ),
      )
      .where(eq(decks.userId, userId))
      .groupBy(decks.id);

    return rows;
  }),

  createDeck: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.insert(decks).values({
        userId: ctx.session.user.id,
        title: input.title,
        description: input.description ?? null,
      }).returning();
    }),

  deleteDeck: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership first
      const [deck] = await db.select({ id: decks.id }).from(decks)
        .where(and(eq(decks.id, input.id), eq(decks.userId, ctx.session.user.id)));

      if (!deck) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deck not found' });
      }

      // Clean up orphaned userProgress rows before deleting cards
      const cards = await db.select({ id: flashcards.id }).from(flashcards)
        .where(eq(flashcards.deckId, input.id));
      const cardIds = cards.map(c => c.id);

      if (cardIds.length > 0) {
        await db.delete(userProgress).where(inArray(userProgress.flashcardId, cardIds));
      }

      await db.delete(flashcards).where(eq(flashcards.deckId, input.id));
      await db.delete(decks).where(eq(decks.id, input.id));
      return { success: true };
    }),
});
