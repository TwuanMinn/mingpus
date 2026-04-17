import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, dictionaryEntries } from '@/db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

export const dictionaryRouter = router({
  searchCharacters: protectedProcedure
    .input(z.object({
      query: z.string().max(100),
      hskLevel: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const q = `%${input.query}%`;

      // 1) Search user's flashcard decks
      const userConditions = [
        eq(decks.userId, ctx.session.user.id),
        or(
          like(flashcards.character, q),
          like(flashcards.pinyin, q),
          like(flashcards.meaning, q),
        ),
      ];

      if (input.hskLevel) {
        userConditions.push(eq(flashcards.hskLevel, input.hskLevel));
      }

      const userResults = await db
        .select({
          id: flashcards.id,
          character: flashcards.character,
          pinyin: flashcards.pinyin,
          meaning: flashcards.meaning,
          strokes: flashcards.strokes,
          hskLevel: flashcards.hskLevel,
          deckTitle: decks.title,
          source: sql<string>`'deck'`.as('source'),
        })
        .from(flashcards)
        .innerJoin(decks, eq(flashcards.deckId, decks.id))
        .where(and(...userConditions))
        .limit(50);

      // 2) Search built-in dictionary
      const dictConditions = [
        or(
          like(dictionaryEntries.simplified, q),
          like(dictionaryEntries.pinyin, q),
          like(dictionaryEntries.meaning, q),
        ),
      ];

      if (input.hskLevel) {
        dictConditions.push(eq(dictionaryEntries.hskLevel, input.hskLevel));
      }

      const dictResults = await db
        .select({
          id: dictionaryEntries.id,
          character: dictionaryEntries.simplified,
          pinyin: dictionaryEntries.pinyin,
          meaning: dictionaryEntries.meaning,
          strokes: sql<number | null>`null`.as('strokes'),
          hskLevel: dictionaryEntries.hskLevel,
          deckTitle: sql<string>`'Dictionary'`.as('deckTitle'),
          source: sql<string>`'dictionary'`.as('source'),
        })
        .from(dictionaryEntries)
        .where(and(...dictConditions))
        .orderBy(dictionaryEntries.frequency)
        .limit(100);

      // 3) Merge: user decks first, then dictionary (deduplicated by character)
      const seenChars = new Set<string>();
      const merged = [];

      for (const r of userResults) {
        if (!seenChars.has(r.character)) {
          seenChars.add(r.character);
          merged.push(r);
        }
      }

      for (const r of dictResults) {
        if (!seenChars.has(r.character)) {
          seenChars.add(r.character);
          merged.push(r);
        }
      }

      return merged;
    }),

  /** Browse all dictionary entries (for Discover page) */
  browseAll: protectedProcedure
    .input(z.object({
      hskLevel: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [];

      if (input.hskLevel) {
        conditions.push(eq(dictionaryEntries.hskLevel, input.hskLevel));
      }

      const results = await db
        .select({
          id: dictionaryEntries.id,
          character: dictionaryEntries.simplified,
          pinyin: dictionaryEntries.pinyin,
          meaning: dictionaryEntries.meaning,
          hskLevel: dictionaryEntries.hskLevel,
        })
        .from(dictionaryEntries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(dictionaryEntries.hskLevel, dictionaryEntries.frequency)
        .limit(2000);

      return results;
    }),
});
