import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress } from '@/db/schema';
import { eq, count, and, inArray } from 'drizzle-orm';

export const deckRouter = router({
  getDecks: protectedProcedure.query(async ({ ctx }) => {
    // Single query with LEFT JOIN + GROUP BY instead of N+1 loop
    return await db
      .select({
        id: decks.id,
        userId: decks.userId,
        title: decks.title,
        description: decks.description,
        createdAt: decks.createdAt,
        cardCount: count(flashcards.id),
      })
      .from(decks)
      .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
      .where(eq(decks.userId, ctx.session.user.id))
      .groupBy(decks.id);
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
