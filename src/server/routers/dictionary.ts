import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and, like, or } from 'drizzle-orm';

export const dictionaryRouter = router({
  searchCharacters: protectedProcedure
    .input(z.object({
      query: z.string().max(100),
      hskLevel: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const q = `%${input.query}%`;
      const conditions = [
        eq(decks.userId, ctx.session.user.id),
        or(
          like(flashcards.character, q),
          like(flashcards.pinyin, q),
          like(flashcards.meaning, q),
        ),
      ];

      if (input.hskLevel) {
        conditions.push(eq(flashcards.hskLevel, input.hskLevel));
      }

      return await db
        .select({
          id: flashcards.id,
          character: flashcards.character,
          pinyin: flashcards.pinyin,
          meaning: flashcards.meaning,
          strokes: flashcards.strokes,
          hskLevel: flashcards.hskLevel,
          deckTitle: decks.title,
        })
        .from(flashcards)
        .innerJoin(decks, eq(flashcards.deckId, decks.id))
        .where(and(...conditions))
        .limit(50);
    }),
});
