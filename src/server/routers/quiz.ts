import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const quizRouter = router({
  getQuizQuestions: protectedProcedure
    .input(z.object({
      count: z.number().min(1).max(50).default(10),
      hskLevel: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(decks.userId, ctx.session.user.id)];
      if (input.hskLevel) conditions.push(eq(flashcards.hskLevel, input.hskLevel));

      const allCards = await db
        .select({
          id: flashcards.id,
          character: flashcards.character,
          pinyin: flashcards.pinyin,
          meaning: flashcards.meaning,
          hskLevel: flashcards.hskLevel,
        })
        .from(flashcards)
        .innerJoin(decks, eq(flashcards.deckId, decks.id))
        .where(and(...conditions));

      const shuffled = shuffle(allCards);
      const questions = shuffled.slice(0, input.count);

      // SECURITY FIX: Don't send correctAnswer to the client.
      // Instead, let the client use submitQuizAnswer for validation.
      return questions.map(q => {
        const distractors = shuffle(allCards.filter(c => c.id !== q.id))
          .slice(0, 3)
          .map(c => c.meaning);

        const options = shuffle([...distractors, q.meaning]);

        return {
          id: q.id,
          character: q.character,
          pinyin: q.pinyin,
          hskLevel: q.hskLevel,
          options,
        };
      });
    }),

  // Server-side answer validation — secure quiz checking
  submitQuizAnswer: protectedProcedure
    .input(z.object({
      flashcardId: z.number(),
      selectedAnswer: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [card] = await db
        .select({ meaning: flashcards.meaning })
        .from(flashcards)
        .innerJoin(decks, eq(flashcards.deckId, decks.id))
        .where(and(eq(flashcards.id, input.flashcardId), eq(decks.userId, ctx.session.user.id)));

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
      }

      const isCorrect = card.meaning === input.selectedAnswer;
      return { isCorrect, correctAnswer: card.meaning };
    }),
});
