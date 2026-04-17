import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { userXP, userAchievements, dailyChallenges, compoundWords, notifications, studySessions } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
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
          streakFreezes: 3,
          graceUsed: false,
          dailyGoal: 20,
        });
        return { totalXP: input.xpAmount, level, levelUp: level > 1, newAchievements: [], streakEvent: null };
      }

      const prev = existing[0];
      const newTotal = prev.totalXP + input.xpAmount;
      const newLevel = levelFromXP(newTotal);
      const levelUp = newLevel > prev.level;

      // ── Streak logic with grace period & freezes ──────────────────────────
      let newStreak = prev.currentStreak;
      let newLongest = prev.longestStreak;
      let newGraceUsed = prev.graceUsed;
      let newFreezes = prev.streakFreezes;
      let streakEvent: 'continued' | 'grace' | 'freeze_used' | 'broken' | null = null;

      if (prev.lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (prev.lastStudyDate === yesterdayStr) {
          // Studied yesterday — normal continuation
          newStreak = prev.currentStreak + 1;
          newGraceUsed = false;
          streakEvent = 'continued';
        } else {
          // Missed at least one day
          if (!prev.graceUsed) {
            // First miss: apply grace period (preserve streak, flag used)
            newStreak = prev.currentStreak; // unchanged
            newGraceUsed = true;
            streakEvent = 'grace';
            await db.insert(notifications).values({
              userId,
              title: '⚠️ Streak Grace Period Used',
              message: `You missed a day but your ${prev.currentStreak}-day streak is safe — this is your one grace pass. Don't miss tomorrow!`,
              type: 'streak',
            });
          } else if (prev.streakFreezes > 0) {
            // Grace already used — auto-spend a freeze
            newStreak = prev.currentStreak; // unchanged
            newFreezes = prev.streakFreezes - 1;
            newGraceUsed = false;
            streakEvent = 'freeze_used';
            await db.insert(notifications).values({
              userId,
              title: '🧊 Streak Freeze Used',
              message: `A streak freeze was used to protect your ${prev.currentStreak}-day streak. ${newFreezes} freeze${newFreezes !== 1 ? 's' : ''} remaining.`,
              type: 'streak',
            });
          } else {
            // No grace, no freezes — streak broken
            newStreak = 1;
            newGraceUsed = false;
            streakEvent = 'broken';
          }
        }
        newLongest = Math.max(newLongest, newStreak);
      }

      // Award a freeze at every 7-day streak milestone
      const prevMilestone = Math.floor(prev.currentStreak / 7);
      const newMilestone  = Math.floor(newStreak / 7);
      if (newStreak > 0 && newMilestone > prevMilestone) {
        newFreezes = Math.min(newFreezes + 1, 10); // cap at 10
        await db.insert(notifications).values({
          userId,
          title: '🧊 Streak Freeze Earned!',
          message: `${newStreak}-day streak milestone! You earned a streak freeze. You now have ${newFreezes}.`,
          type: 'streak',
        });
      }

      await db.update(userXP).set({
        totalXP: newTotal,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastStudyDate: today,
        graceUsed: newGraceUsed,
        streakFreezes: newFreezes,
        updatedAt: new Date(),
      }).where(eq(userXP.userId, userId));

      // Check for new achievements
      const newAchievements = await checkAchievements(userId, newTotal, newStreak);

      return { totalXP: newTotal, level: newLevel, levelUp, newAchievements, streakEvent };
    }),

  /** Manually spend a streak freeze (user-initiated). */
  useStreakFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1);
    if (rows.length === 0 || rows[0].streakFreezes <= 0) {
      return { success: false, reason: 'no_freezes' };
    }
    const newFreezes = rows[0].streakFreezes - 1;
    await db.update(userXP).set({ streakFreezes: newFreezes, graceUsed: false, updatedAt: new Date() })
      .where(eq(userXP.userId, userId));
    return { success: true, freezesRemaining: newFreezes };
  }),

  /** Update the daily card goal for this user. */
  setDailyGoal: protectedProcedure
    .input(z.object({ goal: z.number().min(1).max(200) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const rows = await db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1);
      if (rows.length === 0) {
        await db.insert(userXP).values({ userId, totalXP: 0, level: 1, dailyGoal: input.goal });
      } else {
        await db.update(userXP).set({ dailyGoal: input.goal, updatedAt: new Date() })
          .where(eq(userXP.userId, userId));
      }
      return { dailyGoal: input.goal };
    }),

  /** Detailed streak status — used by StreakWidget. */
  getStreakStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = todayStr();

    const rows = await db.select().from(userXP).where(eq(userXP.userId, userId)).limit(1);
    if (rows.length === 0) {
      return { currentStreak: 0, longestStreak: 0, streakFreezes: 3, graceUsed: false, dailyGoal: 20, dailyProgress: 0 };
    }

    const xp = rows[0];

    // Get today's card count from study sessions
    const sessions = await db
      .select({ cardsReviewed: studySessions.cardsReviewed })
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), eq(studySessions.date, today)));

    const dailyProgress = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0);

    return {
      currentStreak: xp.currentStreak,
      longestStreak: xp.longestStreak,
      streakFreezes: xp.streakFreezes,
      graceUsed: xp.graceUsed,
      dailyGoal: xp.dailyGoal,
      dailyProgress,
    };
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

  // Batch all stat queries into a single SQL statement (replaces 4 separate COUNT queries)
  const [stats] = await db
    .select({
      totalReviews: sql<number>`(SELECT COUNT(*) FROM review_logs WHERE user_id = ${userId})`,
      totalMastered: sql<number>`(SELECT COUNT(*) FROM user_progress WHERE user_id = ${userId} AND repetition >= 5 AND efactor >= 2500)`,
      totalChallenges: sql<number>`(SELECT COUNT(*) FROM daily_challenges WHERE user_id = ${userId} AND completed = 1)`,
      totalDecks: sql<number>`(SELECT COUNT(*) FROM decks WHERE user_id = ${userId})`,
    })
    .from(userXP)
    .where(eq(userXP.userId, userId))
    .limit(1);

  const totalReviews = stats?.totalReviews ?? 0;
  const totalMastered = stats?.totalMastered ?? 0;
  const totalChallenges = stats?.totalChallenges ?? 0;
  const totalDecks = stats?.totalDecks ?? 0;

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
