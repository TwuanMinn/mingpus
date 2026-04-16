import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { userXP, userAchievements, dailyChallenges, reviewLogs, userProgress, flashcards, decks, compoundWords } from '@/db/schema';
import { eq, and, sql, count, desc } from 'drizzle-orm';
import {
  levelFromXP, levelProgress, xpForLevel, getLevelInfo,
  calculateReviewXP, generateDailyChallenges, ACHIEVEMENTS,
  CHALLENGE_TEMPLATES,
} from '@/lib/gamification';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const gamificationRouter = router({
  // ─── XP & Level ───
  getXPStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1);

    if (rows.length === 0) {
      // Initialize XP record
      await db.insert(userXP).values({ userId, totalXP: 0, level: 1 });
      return {
        totalXP: 0,
        level: 1,
        progress: 0,
        xpToNextLevel: xpForLevel(1),
        levelInfo: getLevelInfo(1),
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const xp = rows[0];
    const level = levelFromXP(xp.totalXP);
    return {
      totalXP: xp.totalXP,
      level,
      progress: levelProgress(xp.totalXP),
      xpToNextLevel: xpForLevel(level),
      levelInfo: getLevelInfo(level),
      currentStreak: xp.currentStreak,
      longestStreak: xp.longestStreak,
    };
  }),

  /** Award XP and check for level ups + streak. Called after each review. */
  awardXP: protectedProcedure
    .input(z.object({
      xpAmount: z.number().min(0),
      source: z.string().optional(), // 'review' | 'quiz' | 'challenge' | 'achievement'
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const today = todayStr();

      // Upsert XP record
      const existing = await db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1);

      if (existing.length === 0) {
        const level = levelFromXP(input.xpAmount);
        await db.insert(userXP).values({
          userId,
          totalXP: input.xpAmount,
          level,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
        });
        return { totalXP: input.xpAmount, level, levelUp: level > 1, newAchievements: [] };
      }

      const prev = existing[0];
      const newTotal = prev.totalXP + input.xpAmount;
      const newLevel = levelFromXP(newTotal);
      const levelUp = newLevel > prev.level;

      // Streak logic
      let newStreak = prev.currentStreak;
      let newLongest = prev.longestStreak;

      if (prev.lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (prev.lastStudyDate === yesterdayStr) {
          newStreak = prev.currentStreak + 1;
        } else {
          newStreak = 1; // streak broken
        }
        newLongest = Math.max(newLongest, newStreak);
      }

      await db.update(userXP).set({
        totalXP: newTotal,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastStudyDate: today,
        updatedAt: new Date(),
      }).where(eq(userXP.userId, userId));

      // Check for new achievements
      const newAchievements = await checkAchievements(userId, newTotal, newStreak);

      return { totalXP: newTotal, level: newLevel, levelUp, newAchievements };
    }),

  // ─── Achievements ───
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const unlocked = await db
      .select({
        achievementKey: userAchievements.achievementKey,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedKeys = new Set(unlocked.map(u => u.achievementKey));

    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedKeys.has(a.key),
      unlockedAt: unlocked.find(u => u.achievementKey === a.key)?.unlockedAt ?? null,
    }));
  }),

  getRecentAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await db
      .select({ achievementKey: userAchievements.achievementKey, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(5);
  }),

  // ─── Daily Challenges ───
  getDailyChallenges: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = todayStr();

    const existing = await db
      .select()
      .from(dailyChallenges)
      .where(and(eq(dailyChallenges.userId, userId), eq(dailyChallenges.date, today)));

    if (existing.length > 0) {
      return existing.map(c => {
        const template = CHALLENGE_TEMPLATES.find(t => t.type === c.challengeType);
        return {
          ...c,
          title: template?.title ?? c.challengeType,
          description: (template?.description ?? '').replace('{target}', String(c.targetValue)),
          icon: template?.icon ?? 'task',
        };
      });
    }

    // Generate new daily challenges
    const challenges = generateDailyChallenges();
    const rows = challenges.map(ch => ({
      userId,
      date: today,
      challengeType: ch.type,
      targetValue: ch.target,
      currentValue: 0,
      completed: false,
      xpReward: ch.xpReward,
    }));

    await db.insert(dailyChallenges).values(rows);

    // Re-fetch to get IDs
    return await db
      .select()
      .from(dailyChallenges)
      .where(and(eq(dailyChallenges.userId, userId), eq(dailyChallenges.date, today)))
      .then(rows => rows.map(c => {
        const template = CHALLENGE_TEMPLATES.find(t => t.type === c.challengeType);
        return {
          ...c,
          title: template?.title ?? c.challengeType,
          description: (template?.description ?? '').replace('{target}', String(c.targetValue)),
          icon: template?.icon ?? 'task',
        };
      }));
  }),

  updateChallengeProgress: protectedProcedure
    .input(z.object({
      challengeType: z.string(),
      increment: z.number().default(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const today = todayStr();

      const challenges = await db
        .select()
        .from(dailyChallenges)
        .where(and(
          eq(dailyChallenges.userId, userId),
          eq(dailyChallenges.date, today),
          eq(dailyChallenges.challengeType, input.challengeType),
        ));

      const completed: { id: number; xpReward: number }[] = [];

      for (const ch of challenges) {
        if (ch.completed) continue;
        const newVal = ch.currentValue + input.increment;
        const isComplete = newVal >= ch.targetValue;
        await db.update(dailyChallenges).set({
          currentValue: newVal,
          completed: isComplete,
        }).where(eq(dailyChallenges.id, ch.id));
        if (isComplete) completed.push({ id: ch.id, xpReward: ch.xpReward });
      }

      return { completed };
    }),

  // ─── Compound Words ───
  getCompoundWords: protectedProcedure
    .input(z.object({ character: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(compoundWords)
        .where(eq(compoundWords.character, input.character))
        .limit(8);
    }),
});

// ─── Achievement Checker (internal) ───
async function checkAchievements(userId: string, totalXP: number, streak: number): Promise<string[]> {
  const existing = await db
    .select({ key: userAchievements.achievementKey })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
  const have = new Set(existing.map(e => e.key));

  // Count total reviews
  const reviewResult = await db
    .select({ total: count() })
    .from(reviewLogs)
    .where(eq(reviewLogs.userId, userId));
  const totalReviews = reviewResult[0]?.total ?? 0;

  // Count mastered cards (rep >= 5, efactor >= 2500)
  const masteredResult = await db
    .select({ total: count() })
    .from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      sql`${userProgress.repetition} >= 5`,
      sql`${userProgress.efactor} >= 2500`,
    ));
  const totalMastered = masteredResult[0]?.total ?? 0;

  // Count completed daily challenges
  const challengeResult = await db
    .select({ total: count() })
    .from(dailyChallenges)
    .where(and(
      eq(dailyChallenges.userId, userId),
      eq(dailyChallenges.completed, true),
    ));
  const totalChallenges = challengeResult[0]?.total ?? 0;

  // Count decks
  const deckResult = await db
    .select({ total: count() })
    .from(decks)
    .where(eq(decks.userId, userId));
  const totalDecks = deckResult[0]?.total ?? 0;

  const checks: [string, boolean][] = [
    ['first_review', totalReviews >= 1],
    ['reviews_10', totalReviews >= 10],
    ['reviews_50', totalReviews >= 50],
    ['reviews_100', totalReviews >= 100],
    ['reviews_500', totalReviews >= 500],
    ['reviews_1000', totalReviews >= 1000],
    ['streak_3', streak >= 3],
    ['streak_7', streak >= 7],
    ['streak_30', streak >= 30],
    ['streak_100', streak >= 100],
    ['mastered_10', totalMastered >= 10],
    ['mastered_50', totalMastered >= 50],
    ['daily_x3', totalChallenges >= 3],
    ['daily_x10', totalChallenges >= 10],
    ['deck_creator', totalDecks >= 1],
    ['five_decks', totalDecks >= 5],
  ];

  const newlyUnlocked: string[] = [];

  for (const [key, condition] of checks) {
    if (condition && !have.has(key)) {
      await db.insert(userAchievements).values({ userId, achievementKey: key });
      newlyUnlocked.push(key);
    }
  }

  return newlyUnlocked;
}
