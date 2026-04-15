import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const flashcardRouter = router({
  getCardsForDeck: protectedProcedure
    .input(z.object({ deckId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify deck belongs to current user
      const [deck] = await db.select({ id: decks.id }).from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.userId, ctx.session.user.id)));

      if (!deck) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deck not found' });
      }

      return await db.select().from(flashcards).where(eq(flashcards.deckId, input.deckId));
    }),

  addCard: protectedProcedure
    .input(z.object({
      deckId: z.number(),
      character: z.string().min(1).max(50),
      pinyin: z.string().min(1).max(200),
      meaning: z.string().min(1).max(500),
      strokes: z.number().optional(),
      hskLevel: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify deck ownership before adding
      const [deck] = await db.select({ id: decks.id }).from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.userId, ctx.session.user.id)));

      if (!deck) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot add cards to a deck you do not own' });
      }

      const [card] = await db.insert(flashcards).values({
        deckId: input.deckId,
        character: input.character,
        pinyin: input.pinyin,
        meaning: input.meaning,
        strokes: input.strokes ?? null,
        hskLevel: input.hskLevel ?? null,
      }).returning();

      await db.insert(userProgress).values({
        userId: ctx.session.user.id,
        flashcardId: card.id,
        interval: 0,
        repetition: 0,
        efactor: 2500,
      });

      return card;
    }),

  deleteCard: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify the card belongs to a deck owned by the current user
      const [card] = await db
        .select({ id: flashcards.id })
        .from(flashcards)
        .innerJoin(decks, eq(flashcards.deckId, decks.id))
        .where(and(eq(flashcards.id, input.id), eq(decks.userId, ctx.session.user.id)));

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
      }

      await db.delete(userProgress).where(
        and(eq(userProgress.flashcardId, input.id), eq(userProgress.userId, ctx.session.user.id))
      );
      await db.delete(flashcards).where(eq(flashcards.id, input.id));
      return { success: true };
    }),
});
