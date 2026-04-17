CREATE TABLE `deck_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`deck_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deck_likes_userId_idx` ON `deck_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `deck_likes_deckId_idx` ON `deck_likes` (`deck_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `deck_likes_unique` ON `deck_likes` (`user_id`,`deck_id`);--> statement-breakpoint
ALTER TABLE `decks` ADD `is_public` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `decks` ADD `fork_of` integer;--> statement-breakpoint
ALTER TABLE `decks` ADD `fork_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `decks` ADD `like_count` integer DEFAULT 0 NOT NULL;