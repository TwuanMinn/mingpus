import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '@/db';
import { users, flashcards, decks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getDecks: publicProcedure.query(async () => {
    return await db.select().from(decks);
  }),
});

export type AppRouter = typeof appRouter;
