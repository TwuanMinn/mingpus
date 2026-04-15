import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id)
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password')
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull()
});

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const flashcards = pgTable('flashcards', {
  id: serial('id').primaryKey(),
  deckId: integer('deckId').references(() => decks.id).notNull(),
  character: text('character').notNull(),
  pinyin: text('pinyin').notNull(),
  meaning: text('meaning').notNull(),
  strokes: integer('strokes'),
  hskLevel: integer('hskLevel'),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id).notNull(),
  flashcardId: integer('flashcardId').references(() => flashcards.id).notNull(),
  interval: integer('interval').default(0).notNull(),
  repetition: integer('repetition').default(0).notNull(),
  efactor: integer('efactor').default(2500).notNull(), // standard SM-2 EF * 1000
  dueDate: timestamp('dueDate').defaultNow().notNull(),
});
