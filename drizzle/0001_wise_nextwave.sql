ALTER TABLE `user_xp` ADD `streak_freezes` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_xp` ADD `grace_used` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_xp` ADD `daily_goal` integer DEFAULT 20 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `progress_userId_flashcardId_unq` ON `user_progress` (`user_id`,`flashcard_id`);