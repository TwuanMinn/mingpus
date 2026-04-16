/**
 * Migration: Add gamification + content depth tables to existing database.
 * Safe to run multiple times — uses IF NOT EXISTS.
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const migrations = [
  // ─── Gamification: XP Tracking ───
  `CREATE TABLE IF NOT EXISTS "user_xp" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
    "total_xp" integer DEFAULT 0 NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "longest_streak" integer DEFAULT 0 NOT NULL,
    "last_study_date" text,
    "updated_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "user_xp_userId_idx" ON "user_xp"("user_id")`,

  // ─── Gamification: Achievements ───
  `CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "achievement_key" text NOT NULL,
    "unlocked_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "achievements_userId_idx" ON "user_achievements"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "achievements_key_idx" ON "user_achievements"("user_id", "achievement_key")`,

  // ─── Gamification: Daily Challenges ───
  `CREATE TABLE IF NOT EXISTS "daily_challenges" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "date" text NOT NULL,
    "challenge_type" text NOT NULL,
    "target_value" integer NOT NULL,
    "current_value" integer DEFAULT 0 NOT NULL,
    "completed" integer DEFAULT 0 NOT NULL,
    "xp_reward" integer DEFAULT 50 NOT NULL,
    "created_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "challenges_userId_date_idx" ON "daily_challenges"("user_id", "date")`,

  // ─── Content: Compound Words ───
  `CREATE TABLE IF NOT EXISTS "compound_words" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "character" text NOT NULL,
    "word" text NOT NULL,
    "pinyin" text NOT NULL,
    "meaning" text NOT NULL,
    "hsk_level" integer
  )`,
  `CREATE INDEX IF NOT EXISTS "compound_words_char_idx" ON "compound_words"("character")`,

  // ─── Ensure missing tables from earlier migrations ───
  `CREATE TABLE IF NOT EXISTS "study_sessions" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "date" text NOT NULL,
    "cards_reviewed" integer DEFAULT 0 NOT NULL,
    "cards_correct" integer DEFAULT 0 NOT NULL,
    "study_minutes" integer DEFAULT 0 NOT NULL,
    "created_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "study_sessions"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "sessions_date_idx" ON "study_sessions"("user_id", "date")`,

  `CREATE TABLE IF NOT EXISTS "review_logs" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "flashcard_id" integer NOT NULL REFERENCES "flashcards"("id") ON DELETE CASCADE,
    "quality" integer NOT NULL,
    "response_time_ms" integer,
    "created_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "review_logs_userId_idx" ON "review_logs"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "review_logs_createdAt_idx" ON "review_logs"("user_id", "created_at")`,
  `CREATE INDEX IF NOT EXISTS "review_logs_flashcardId_idx" ON "review_logs"("flashcard_id")`,

  `CREATE TABLE IF NOT EXISTS "character_sentences" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "character" text NOT NULL,
    "sentence" text NOT NULL,
    "pinyin" text NOT NULL,
    "translation" text NOT NULL,
    "hsk_level" integer
  )`,
  `CREATE INDEX IF NOT EXISTS "sentences_character_idx" ON "character_sentences"("character")`,

  `CREATE TABLE IF NOT EXISTS "character_radicals" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "character" text NOT NULL UNIQUE,
    "radicals" text NOT NULL,
    "decomposition" text,
    "etymology" text
  )`,

  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text NOT NULL,
    "read" integer DEFAULT 0 NOT NULL,
    "data" text,
    "created_at" integer NOT NULL DEFAULT (cast(unixepoch() as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("user_id", "read")`,

  // ─── Indexes for existing tables that may be missing ───
  `CREATE INDEX IF NOT EXISTS "flashcards_deckId_idx" ON "flashcards"("deck_id")`,
  `CREATE INDEX IF NOT EXISTS "flashcards_hskLevel_idx" ON "flashcards"("hsk_level")`,
  `CREATE INDEX IF NOT EXISTS "flashcards_character_idx" ON "flashcards"("character")`,
  `CREATE INDEX IF NOT EXISTS "progress_userId_idx" ON "user_progress"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "progress_dueDate_idx" ON "user_progress"("user_id", "due_date")`,
  `CREATE INDEX IF NOT EXISTS "progress_flashcardId_idx" ON "user_progress"("flashcard_id")`,
];

console.log('🔄 Running migrations...');
let applied = 0;

for (const sql of migrations) {
  try {
    db.exec(sql);
    applied++;
  } catch (err) {
    // Ignore "already exists" errors
    if (!err.message.includes('already exists')) {
      console.warn(`⚠️  ${err.message}`);
    }
  }
}

console.log(`✅ Applied ${applied}/${migrations.length} migration statements`);

// ─── Seed compound words if empty ───
const count = db.prepare('SELECT COUNT(*) as c FROM compound_words').get();
if (count.c === 0) {
  console.log('📝 Seeding compound words...');
  const compounds = [
    // 学 (xué) - Study
    ['学', '学生', 'xuéshēng', 'student', 1],
    ['学', '学校', 'xuéxiào', 'school', 1],
    ['学', '学习', 'xuéxí', 'to study/learn', 1],
    ['学', '大学', 'dàxué', 'university', 2],
    ['学', '同学', 'tóngxué', 'classmate', 1],
    // 人 (rén) - Person
    ['人', '人们', 'rénmen', 'people', 2],
    ['人', '大人', 'dàrén', 'adult', 2],
    ['人', '工人', 'gōngrén', 'worker', 3],
    ['人', '个人', 'gèrén', 'individual', 3],
    // 大 (dà) - Big
    ['大', '大家', 'dàjiā', 'everyone', 1],
    ['大', '大学', 'dàxué', 'university', 2],
    ['大', '伟大', 'wěidà', 'great/mighty', 4],
    // 中 (zhōng) - Middle
    ['中', '中国', 'zhōngguó', 'China', 1],
    ['中', '中文', 'zhōngwén', 'Chinese language', 1],
    ['中', '中间', 'zhōngjiān', 'middle/between', 2],
    ['中', '中心', 'zhōngxīn', 'center', 3],
    // 好 (hǎo) - Good
    ['好', '好吃', 'hǎochī', 'delicious', 1],
    ['好', '好看', 'hǎokàn', 'good-looking', 1],
    ['好', '好人', 'hǎorén', 'good person', 1],
    // 书 (shū) - Book
    ['书', '书法', 'shūfǎ', 'calligraphy', 3],
    ['书', '书包', 'shūbāo', 'schoolbag', 2],
    ['书', '读书', 'dúshū', 'to read/study', 2],
    // 水 (shuǐ) - Water
    ['水', '水果', 'shuǐguǒ', 'fruit', 1],
    ['水', '喝水', 'hēshuǐ', 'to drink water', 1],
    ['水', '水平', 'shuǐpíng', 'level/standard', 3],
    // 心 (xīn) - Heart
    ['心', '开心', 'kāixīn', 'happy', 2],
    ['心', '小心', 'xiǎoxīn', 'be careful', 2],
    ['心', '中心', 'zhōngxīn', 'center', 3],
    ['心', '心情', 'xīnqíng', 'mood', 3],
    // 爱 (ài) - Love
    ['爱', '爱好', 'àihào', 'hobby', 2],
    ['爱', '可爱', 'kěài', 'cute/lovely', 2],
    ['爱', '爱情', 'àiqíng', 'romantic love', 4],
    // 天 (tiān) - Day/Sky
    ['天', '今天', 'jīntiān', 'today', 1],
    ['天', '明天', 'míngtiān', 'tomorrow', 1],
    ['天', '天气', 'tiānqì', 'weather', 1],
    ['天', '每天', 'měitiān', 'every day', 1],
    // 日 (rì) - Sun/Day
    ['日', '日本', 'rìběn', 'Japan', 2],
    ['日', '生日', 'shēngrì', 'birthday', 1],
    ['日', '日记', 'rìjì', 'diary', 3],
    // 月 (yuè) - Moon/Month
    ['月', '月亮', 'yuèliàng', 'moon', 2],
    ['月', '一月', 'yīyuè', 'January', 1],
    // 火 (huǒ) - Fire
    ['火', '火车', 'huǒchē', 'train', 1],
    ['火', '大火', 'dàhuǒ', 'big fire', 2],
    // 山 (shān) - Mountain
    ['山', '山水', 'shānshuǐ', 'landscape', 3],
    ['山', '上山', 'shàngshān', 'go up the mountain', 2],
    // 龙 (lóng) - Dragon
    ['龙', '恐龙', 'kǒnglóng', 'dinosaur', 4],
    ['龙', '龙舟', 'lóngzhōu', 'dragon boat', 4],
    // 永 (yǒng) - Eternity
    ['永', '永远', 'yǒngyuǎn', 'forever', 3],
    ['永', '永恒', 'yǒnghéng', 'eternal', 5],
  ];

  const insert = db.prepare('INSERT INTO compound_words (character, word, pinyin, meaning, hsk_level) VALUES (?, ?, ?, ?, ?)');
  const batch = db.transaction((items) => {
    for (const item of items) insert.run(...item);
  });
  batch(compounds);
  console.log(`  → Inserted ${compounds.length} compound words`);
}

console.log('✅ Migration complete!');
db.close();
