CREATE TABLE `assessmentReports` (
	`id` varchar(32) NOT NULL,
	`companyName` varchar(160) NOT NULL,
	`contactName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`industry` varchar(120) NOT NULL,
	`payload` json NOT NULL,
	`reportJson` json NOT NULL,
	`annualSavings` decimal(14,2) NOT NULL,
	`annualProfit` decimal(14,2) NOT NULL,
	`totalPotentialValue` decimal(14,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
