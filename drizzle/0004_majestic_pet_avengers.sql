CREATE TABLE `dictionary_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`simplified` text NOT NULL,
	`traditional` text,
	`pinyin` text NOT NULL,
	`meaning` text NOT NULL,
	`hsk_level` integer,
	`frequency` integer,
	`part_of_speech` text
);
--> statement-breakpoint
CREATE INDEX `dict_simplified_idx` ON `dictionary_entries` (`simplified`);--> statement-breakpoint
CREATE INDEX `dict_pinyin_idx` ON `dictionary_entries` (`pinyin`);--> statement-breakpoint
CREATE INDEX `dict_hsk_idx` ON `dictionary_entries` (`hsk_level`);--> statement-breakpoint
CREATE INDEX `dict_frequency_idx` ON `dictionary_entries` (`frequency`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_decks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`fork_of` integer,
	`fork_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fork_of`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_decks`("id", "user_id", "title", "description", "created_at", "is_public", "fork_of", "fork_count", "like_count") SELECT "id", "user_id", "title", "description", "created_at", "is_public", "fork_of", "fork_count", "like_count" FROM `decks`;--> statement-breakpoint
DROP TABLE `decks`;--> statement-breakpoint
ALTER TABLE `__new_decks` RENAME TO `decks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `decks_userId_idx` ON `decks` (`user_id`);--> statement-breakpoint
CREATE INDEX `decks_forkOf_idx` ON `decks` (`fork_of`);--> statement-breakpoint
CREATE INDEX `decks_isPublic_idx` ON `decks` (`is_public`);