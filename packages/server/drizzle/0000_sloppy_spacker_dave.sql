CREATE TABLE `form_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`form_spec_id` int NOT NULL,
	`current_status` varchar(128) NOT NULL,
	`form_data` text NOT NULL,
	`flow_remark` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `form_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_specs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`form_config` text NOT NULL,
	`flow_config` text NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `form_specs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(128) NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `form_instances` ADD CONSTRAINT `form_instances_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `form_instances` ADD CONSTRAINT `form_instances_form_spec_id_form_specs_id_fk` FOREIGN KEY (`form_spec_id`) REFERENCES `form_specs`(`id`) ON DELETE no action ON UPDATE no action;