import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { decks, flashcards, deckLikes, user } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const communityRouter = router({
  /** Publish or unpublish a deck. */
  publishDeck: protectedProcedure
    .input(z.object({ deckId: z.number(), isPublic: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const [deck] = await db.select().from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.userId, ctx.session.user.id)));
      if (!deck) throw new TRPCError({ code: 'NOT_FOUND' });

      await db.update(decks).set({ isPublic: input.isPublic })
        .where(eq(decks.id, input.deckId));
      return { isPublic: input.isPublic };
    }),

  /** Browse public community decks with optional search. */
  browseCommunityDecks: protectedProcedure
    .input(z.object({
      search: z.string().max(100).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const rows = await db
        .select({
          id: decks.id,
          title: decks.title,
          description: decks.description,
          authorId: decks.userId,
          authorName: user.name,
          forkCount: decks.forkCount,
          likeCount: decks.likeCount,
          forkOf: decks.forkOf,
          createdAt: decks.createdAt,
          cardCount: sql<number>`(SELECT COUNT(*) FROM flashcards WHERE deck_id = ${decks.id})`,
        })
        .from(decks)
        .innerJoin(user, eq(decks.userId, user.id))
        .where(eq(decks.isPublic, true))
        .orderBy(desc(decks.likeCount), desc(decks.forkCount))
        .limit(input.limit)
        .offset(input.offset);

      // Check which ones the current user has liked
      const liked = await db
        .select({ deckId: deckLikes.deckId })
        .from(deckLikes)
        .where(eq(deckLikes.userId, userId));
      const likedSet = new Set(liked.map((l) => l.deckId));

      const filtered = input.search
        ? rows.filter((r) =>
            r.title.toLowerCase().includes(input.search!.toLowerCase()) ||
            (r.description ?? '').toLowerCase().includes(input.search!.toLowerCase()),
          )
        : rows;

      return filtered.map((r) => ({
        ...r,
        isOwn: r.authorId === userId,
        liked: likedSet.has(r.id),
      }));
    }),

  /** Fork a public deck into the current user's collection. */
  forkDeck: protectedProcedure
    .input(z.object({ deckId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const [source] = await db.select().from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.isPublic, true)));
      if (!source) throw new TRPCError({ code: 'NOT_FOUND', message: 'Deck not found or not public' });

      // Create the forked deck
      const [newDeck] = await db.insert(decks).values({
        userId,
        title: `${source.title} (fork)`,
        description: source.description,
        isPublic: false,
        forkOf: source.id,
      }).returning();

      // Copy all cards
      const cards = await db.select().from(flashcards).where(eq(flashcards.deckId, source.id));
      if (cards.length > 0) {
        await db.insert(flashcards).values(
          cards.map((c) => ({
            deckId: newDeck.id,
            character: c.character,
            pinyin: c.pinyin,
            meaning: c.meaning,
            strokes: c.strokes,
            hskLevel: c.hskLevel,
          })),
        );
      }

      // Increment fork count on source
      await db.update(decks).set({ forkCount: sql`fork_count + 1` })
        .where(eq(decks.id, source.id));

      return { deckId: newDeck.id, cardsCopied: cards.length };
    }),

  /** Like or unlike a public deck. */
  toggleLike: protectedProcedure
    .input(z.object({ deckId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const [existing] = await db.select().from(deckLikes)
        .where(and(eq(deckLikes.userId, userId), eq(deckLikes.deckId, input.deckId)));

      if (existing) {
        await db.delete(deckLikes)
          .where(and(eq(deckLikes.userId, userId), eq(deckLikes.deckId, input.deckId)));
        await db.update(decks).set({ likeCount: sql`MAX(0, like_count - 1)` })
          .where(eq(decks.id, input.deckId));
        return { liked: false };
      } else {
        await db.insert(deckLikes).values({ userId, deckId: input.deckId });
        await db.update(decks).set({ likeCount: sql`like_count + 1` })
          .where(eq(decks.id, input.deckId));
        return { liked: true };
      }
    }),

  /** Get decks the current user has published. */
  getMyPublicDecks: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: decks.id,
        title: decks.title,
        description: decks.description,
        isPublic: decks.isPublic,
        likeCount: decks.likeCount,
        forkCount: decks.forkCount,
        cardCount: sql<number>`(SELECT COUNT(*) FROM flashcards WHERE deck_id = ${decks.id})`,
      })
      .from(decks)
      .where(eq(decks.userId, ctx.session.user.id))
      .orderBy(desc(decks.createdAt));
  }),
});
