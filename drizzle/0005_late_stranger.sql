DROP INDEX `sessions_date_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_userId_date_unq` ON `study_sessions` (`user_id`,`date`);