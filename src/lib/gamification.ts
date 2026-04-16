// ─── XP & Level System ───

/** XP curve: each level requires exponentially more XP */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/** Calculate level from total XP */
export function levelFromXP(totalXP: number): number {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

/** XP progress within current level (0–1) */
export function levelProgress(totalXP: number): number {
  let remaining = totalXP;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return remaining / xpForLevel(level);
}

/** Calculate XP earned from a review */
export function calculateReviewXP(
  quality: number,
  streak: number,
  responseTimeMs?: number | null,
): number {
  const baseXP = quality >= 5 ? 15 : quality >= 4 ? 12 : quality >= 3 ? 8 : 3;
  const streakMultiplier = 1 + Math.min(streak * 0.1, 2.0); // Max 3x
  const speedBonus = responseTimeMs && responseTimeMs < 3000 ? 5 : 0;
  return Math.round(baseXP * streakMultiplier + speedBonus);
}

// ─── Level Titles ───

export interface LevelInfo {
  title: string;
  titleCN: string;
  icon: string;
  minLevel: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { title: 'Novice',          titleCN: '初学',   icon: 'school',             minLevel: 1 },
  { title: 'Apprentice',      titleCN: '学徒',   icon: 'auto_stories',       minLevel: 5 },
  { title: 'Scholar',         titleCN: '学者',   icon: 'history_edu',        minLevel: 10 },
  { title: 'Calligrapher',    titleCN: '书法家', icon: 'brush',              minLevel: 15 },
  { title: 'Master',          titleCN: '大师',   icon: 'workspace_premium',  minLevel: 20 },
  { title: 'Grandmaster',     titleCN: '宗师',   icon: 'diamond',            minLevel: 30 },
  { title: 'Sage',            titleCN: '圣人',   icon: 'star',               minLevel: 50 },
];

export function getLevelInfo(level: number): LevelInfo {
  let info = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.minLevel) info = tier;
  }
  return info;
}

// ─── Achievement Definitions ───

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'mastery' | 'challenge' | 'exploration';
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Milestone achievements
  { key: 'first_review',     title: 'First Steps 起步',       description: 'Complete your first review',                        icon: 'flag',              category: 'milestone',    xpReward: 25 },
  { key: 'reviews_10',       title: 'Getting Started 入门',   description: 'Complete 10 reviews',                               icon: 'emoji_events',      category: 'milestone',    xpReward: 50 },
  { key: 'reviews_50',       title: 'Half Century 半百',      description: 'Complete 50 reviews',                               icon: 'military_tech',     category: 'milestone',    xpReward: 100 },
  { key: 'reviews_100',      title: 'Century Master 百达',    description: 'Complete 100 reviews',                              icon: 'workspace_premium', category: 'milestone',    xpReward: 200 },
  { key: 'reviews_500',      title: 'Diamond Scholar 钻石',   description: 'Complete 500 reviews',                              icon: 'diamond',           category: 'milestone',    xpReward: 500 },
  { key: 'reviews_1000',     title: 'Legendary 传奇',         description: 'Complete 1,000 reviews',                            icon: 'star',              category: 'milestone',    xpReward: 1000 },

  // Streak achievements
  { key: 'streak_3',         title: 'On Fire 🔥',             description: 'Maintain a 3-day study streak',                     icon: 'local_fire_department', category: 'streak',   xpReward: 30 },
  { key: 'streak_7',         title: 'Week Warrior 周战士',    description: 'Maintain a 7-day study streak',                     icon: 'local_fire_department', category: 'streak',   xpReward: 75 },
  { key: 'streak_30',        title: 'Monthly Master 月达人',  description: 'Maintain a 30-day study streak',                    icon: 'local_fire_department', category: 'streak',   xpReward: 300 },
  { key: 'streak_100',       title: 'Unstoppable 不可挡',     description: 'Maintain a 100-day study streak',                   icon: 'bolt',              category: 'streak',       xpReward: 1000 },

  // Mastery achievements
  { key: 'perfect_session',  title: 'Perfect Session 完美',   description: 'Get every card right in a session (min 5 cards)',    icon: 'check_circle',      category: 'mastery',      xpReward: 50 },
  { key: 'speed_demon',      title: 'Speed Demon 快手',       description: 'Answer 10 cards correctly under 3 seconds each',    icon: 'bolt',              category: 'mastery',      xpReward: 75 },
  { key: 'mastered_10',      title: 'Solid Foundation 基础',  description: 'Fully master 10 characters (rep ≥ 5, EF ≥ 2.5)',    icon: 'verified',          category: 'mastery',      xpReward: 100 },
  { key: 'mastered_50',      title: 'Growing Library 成长',   description: 'Fully master 50 characters',                        icon: 'library_books',     category: 'mastery',      xpReward: 250 },

  // Challenge achievements  
  { key: 'daily_x3',         title: 'Triple Threat 三连击',   description: 'Complete 3 daily challenges',                       icon: 'task_alt',          category: 'challenge',    xpReward: 60 },
  { key: 'daily_x10',        title: 'Challenge Champ 挑战者', description: 'Complete 10 daily challenges',                      icon: 'emoji_events',      category: 'challenge',    xpReward: 150 },

  // Exploration achievements
  { key: 'first_quiz',       title: 'Quiz Taker 测验者',      description: 'Complete your first quiz',                          icon: 'quiz',              category: 'exploration',  xpReward: 25 },
  { key: 'first_stroke',     title: 'Brush Master 笔之初',    description: 'Practice your first stroke character',              icon: 'brush',             category: 'exploration',  xpReward: 25 },
  { key: 'deck_creator',     title: 'Curator 策展人',         description: 'Create your first deck',                            icon: 'library_add',       category: 'exploration',  xpReward: 30 },
  { key: 'five_decks',       title: 'Collector 收藏家',       description: 'Create 5 decks',                                    icon: 'collections',       category: 'exploration',  xpReward: 75 },
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.key === key);
}

// ─── Daily Challenge Definitions ───

export interface ChallengeDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  targetRange: [number, number]; // min/max target value
  xpReward: number;
}

export const CHALLENGE_TEMPLATES: ChallengeDef[] = [
  { type: 'review_count',    title: 'Card Crusher',     description: 'Review {target} cards today',              icon: 'style',             targetRange: [10, 30], xpReward: 40 },
  { type: 'perfect_recall',  title: 'Perfect Recall',   description: 'Get {target} perfect recalls (Easy)',      icon: 'psychology',        targetRange: [3, 10],  xpReward: 60 },
  { type: 'streak_maintain', title: 'Keep the Fire',     description: 'Maintain your study streak today',         icon: 'local_fire_department', targetRange: [1, 1], xpReward: 30 },
  { type: 'quiz_score',      title: 'Quiz Champion',    description: 'Score {target}+ points in a quiz',         icon: 'quiz',              targetRange: [100, 300], xpReward: 50 },
];

/** Pick 3 random challenges for today */
export function generateDailyChallenges(): { type: string; target: number; xpReward: number }[] {
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(tmpl => {
    const [min, max] = tmpl.targetRange;
    const target = Math.floor(Math.random() * (max - min + 1)) + min;
    return { type: tmpl.type, target, xpReward: tmpl.xpReward };
  });
}
