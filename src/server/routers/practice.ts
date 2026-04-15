import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { flashcards, userProgress } from '@/db/schema';
import { eq, and, lte, asc } from 'drizzle-orm';
import { sm2, getDueDate } from '@/lib/sm2';

export const practiceRouter = router({
  getDueCards: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input, ctx }) => {
      return await db
        .select({
          progressId: userProgress.id,
          flashcardId: userProgress.flashcardId,
          interval: userProgress.interval,
          repetition: userProgress.repetition,
          efactor: userProgress.efactor,
          character: flashcards.character,
          pinyin: flashcards.pinyin,
          meaning: flashcards.meaning,
          strokes: flashcards.strokes,
          hskLevel: flashcards.hskLevel,
        })
        .from(userProgress)
        .innerJoin(flashcards, eq(userProgress.flashcardId, flashcards.id))
        .where(
          and(
            eq(userProgress.userId, ctx.session.user.id),
            lte(userProgress.dueDate, new Date())
          )
        )
        .orderBy(asc(userProgress.dueDate))
        .limit(input.limit);
    }),

  submitReview: protectedProcedure
    .input(z.object({
      progressId: z.number(),
      quality: z.number().min(0).max(5),
    }))
    .mutation(async ({ input, ctx }) => {
      const [progress] = await db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.id, input.progressId), eq(userProgress.userId, ctx.session.user.id)));

      if (!progress) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Progress record not found' });
      }

      // Use the shared SM-2 implementation instead of inlining the algorithm
      const result = sm2({
        quality: input.quality,
        repetition: progress.repetition,
        interval: progress.interval,
        efactor: progress.efactor,
      });

      const dueDate = getDueDate(result.interval);

      await db.update(userProgress).set({
        interval: result.interval,
        repetition: result.repetition,
        efactor: result.efactor,
        dueDate,
      }).where(eq(userProgress.id, input.progressId));

      return result;
    }),
});
