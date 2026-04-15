import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, userProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const importRouter = router({
  importCards: protectedProcedure
    .input(z.object({
      deckId: z.number(),
      cards: z.array(z.object({
        character: z.string().min(1).max(50),
        pinyin: z.string().min(1).max(200),
        meaning: z.string().min(1).max(500),
        strokes: z.number().optional(),
        hskLevel: z.number().optional(),
      })).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify deck ownership
      const [deck] = await db.select({ id: decks.id }).from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.userId, ctx.session.user.id)));

      if (!deck) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deck not found' });
      }

      let imported = 0;

      // Wrap in a transaction so a partial failure rolls back cleanly
      await db.transaction(async (tx) => {
        for (const card of input.cards) {
          const [newCard] = await tx.insert(flashcards).values({
            deckId: input.deckId,
            character: card.character,
            pinyin: card.pinyin,
            meaning: card.meaning,
            strokes: card.strokes ?? null,
            hskLevel: card.hskLevel ?? null,
          }).returning();

          await tx.insert(userProgress).values({
            userId: ctx.session.user.id,
            flashcardId: newCard.id,
            interval: 0,
            repetition: 0,
            efactor: 2500,
          });

          imported++;
        }
      });

      return { imported };
    }),
});
