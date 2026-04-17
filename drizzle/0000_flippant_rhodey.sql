CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `character_radicals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character` text NOT NULL,
	`radicals` text NOT NULL,
	`decomposition` text,
	`etymology` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `character_radicals_character_unique` ON `character_radicals` (`character`);--> statement-breakpoint
CREATE TABLE `character_sentences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character` text NOT NULL,
	`sentence` text NOT NULL,
	`pinyin` text NOT NULL,
	`translation` text NOT NULL,
	`hsk_level` integer
);
--> statement-breakpoint
CREATE INDEX `sentences_character_idx` ON `character_sentences` (`character`);--> statement-breakpoint
CREATE TABLE `compound_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character` text NOT NULL,
	`word` text NOT NULL,
	`pinyin` text NOT NULL,
	`meaning` text NOT NULL,
	`hsk_level` integer
);
--> statement-breakpoint
CREATE INDEX `compound_words_char_idx` ON `compound_words` (`character`);--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`challenge_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`xp_reward` integer DEFAULT 50 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `challenges_userId_date_idx` ON `daily_challenges` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `decks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deck_id` integer NOT NULL,
	`character` text NOT NULL,
	`pinyin` text NOT NULL,
	`meaning` text NOT NULL,
	`strokes` integer,
	`hsk_level` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `flashcards_deckId_idx` ON `flashcards` (`deck_id`);--> statement-breakpoint
CREATE INDEX `flashcards_hskLevel_idx` ON `flashcards` (`hsk_level`);--> statement-breakpoint
CREATE INDEX `flashcards_character_idx` ON `flashcards` (`character`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`data` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`user_id`,`read`);--> statement-breakpoint
CREATE TABLE `review_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`flashcard_id` integer NOT NULL,
	`quality` integer NOT NULL,
	`response_time_ms` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `review_logs_userId_idx` ON `review_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `review_logs_createdAt_idx` ON `review_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `review_logs_flashcardId_idx` ON `review_logs` (`flashcard_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`cards_reviewed` integer DEFAULT 0 NOT NULL,
	`cards_correct` integer DEFAULT 0 NOT NULL,
	`study_minutes` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `study_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_date_idx` ON `study_sessions` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`achievement_key` text NOT NULL,
	`unlocked_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `achievements_userId_idx` ON `user_achievements` (`user_id`);--> statement-breakpoint
CREATE INDEX `achievements_key_idx` ON `user_achievements` (`user_id`,`achievement_key`);--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`flashcard_id` integer NOT NULL,
	`interval` integer DEFAULT 0 NOT NULL,
	`repetition` integer DEFAULT 0 NOT NULL,
	`efactor` integer DEFAULT 2500 NOT NULL,
	`due_date` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progress_userId_idx` ON `user_progress` (`user_id`);--> statement-breakpoint
CREATE INDEX `progress_dueDate_idx` ON `user_progress` (`user_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `progress_flashcardId_idx` ON `user_progress` (`flashcard_id`);--> statement-breakpoint
CREATE TABLE `user_xp` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_study_date` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_xp_user_id_unique` ON `user_xp` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_xp_userId_idx` ON `user_xp` (`user_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);