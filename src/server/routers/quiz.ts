import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

      const shuffled = allCards.sort(() => Math.random() - 0.5);
      const questions = shuffled.slice(0, input.count);

      return questions.map(q => {
        const distractors = allCards
          .filter(c => c.id !== q.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.meaning);

        const options = [...distractors, q.meaning].sort(() => Math.random() - 0.5);

        return {
          ...q,
          options,
          correctAnswer: q.meaning,
        };
      });
    }),

  // Server-side answer validation — quiz pages can migrate to this
  // instead of trusting client-side correctAnswer checks
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
