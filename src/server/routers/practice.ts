import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { flashcards, userProgress, reviewLogs } from '@/db/schema';
import { eq, and, lte, asc } from 'drizzle-orm';
import {
  fsrsNewCard, fsrsReview, getDueDateFSRS, qualityToFSRS, sm2ToFSRSStability,
  type FSRSState,
} from '@/lib/fsrs';

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
          fsrsStability: userProgress.fsrsStability,
          fsrsDifficulty: userProgress.fsrsDifficulty,
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
      responseTimeMs: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const [progress] = await tx
          .select()
          .from(userProgress)
          .where(and(eq(userProgress.id, input.progressId), eq(userProgress.userId, ctx.session.user.id)));

        if (!progress) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Progress record not found' });
        }

        const rating = qualityToFSRS(input.quality);

        let fsrsResult: ReturnType<typeof fsrsNewCard>;

        if (progress.fsrsStability === null || progress.fsrsDifficulty === null) {
          // ── First FSRS review: check if card was previously learned via SM-2 ──
          if (progress.repetition > 0 && progress.interval > 0) {
            // Card has SM-2 history — migrate to FSRS initial state
            const migratedStability = sm2ToFSRSStability(progress.efactor, progress.repetition, progress.interval);
            const migratedDifficulty = 5; // neutral starting point
            const state: FSRSState = {
              stability: migratedStability,
              difficulty: migratedDifficulty,
              lastReview: new Date(Date.now() - progress.interval * 86_400_000),
            };
            fsrsResult = fsrsReview(state, rating);
          } else {
            // Brand-new card
            fsrsResult = fsrsNewCard(rating);
          }
        } else {
          // ── Subsequent FSRS review ──
          const state: FSRSState = {
            stability:  progress.fsrsStability  / 1000,
            difficulty: progress.fsrsDifficulty / 1000,
            lastReview: new Date(Date.now() - progress.interval * 86_400_000),
          };
          fsrsResult = fsrsReview(state, rating);
        }

        const dueDate = getDueDateFSRS(fsrsResult.interval);

        await tx.update(userProgress).set({
          interval:      fsrsResult.interval,
          repetition:    input.quality >= 3 ? progress.repetition + 1 : 0,
          fsrsStability:  Math.round(fsrsResult.stability  * 1000),
          fsrsDifficulty: Math.round(fsrsResult.difficulty * 1000),
          dueDate,
        }).where(eq(userProgress.id, input.progressId));

        await tx.insert(reviewLogs).values({
          userId: ctx.session.user.id,
          flashcardId: progress.flashcardId,
          quality: input.quality,
          responseTimeMs: input.responseTimeMs ?? null,
        });

        return {
          interval:      fsrsResult.interval,
          stability:     fsrsResult.stability,
          difficulty:    fsrsResult.difficulty,
          retrievability: fsrsResult.retrievability,
        };
      });
    }),
});
