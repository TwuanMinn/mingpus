const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'local.db');

// Delete existing DB
[dbPath, dbPath + '-wal', dbPath + '-shm'].forEach(f => {
  try { fs.unlinkSync(f); } catch {}
});

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" integer DEFAULT 0 NOT NULL,
    "image" text,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  );

  CREATE TABLE "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" integer NOT NULL,
    "token" text NOT NULL UNIQUE,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
  );
  CREATE INDEX "session_userId_idx" ON "session"("user_id");

  CREATE TABLE "account" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" integer,
    "refresh_token_expires_at" integer,
    "scope" text,
    "password" text,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  );
  CREATE INDEX "account_userId_idx" ON "account"("user_id");

  CREATE TABLE "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" integer NOT NULL,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  );
  CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

  CREATE TABLE "decks" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id"),
    "title" text NOT NULL,
    "description" text,
    "created_at" integer NOT NULL
  );

  CREATE TABLE "flashcards" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "deck_id" integer NOT NULL REFERENCES "decks"("id"),
    "character" text NOT NULL,
    "pinyin" text NOT NULL,
    "meaning" text NOT NULL,
    "strokes" integer,
    "hsk_level" integer,
    "created_at" integer NOT NULL
  );

  CREATE TABLE "user_progress" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text NOT NULL REFERENCES "user"("id"),
    "flashcard_id" integer NOT NULL REFERENCES "flashcards"("id"),
    "interval" integer DEFAULT 0 NOT NULL,
    "repetition" integer DEFAULT 0 NOT NULL,
    "efactor" integer DEFAULT 2500 NOT NULL,
    "due_date" integer NOT NULL
  );
`);

console.log('✅ Database recreated with snake_case columns at:', dbPath);
db.close();
