-- SQL Script to Drop Unused Tables
-- Run this script against your MySQL database to remove unused tables

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop VideoTag table (junction table for Video-Tag relationship)
DROP TABLE IF EXISTS video_tag;
DROP TABLE IF EXISTS VideoTag;

-- Drop Tag table
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS Tag;

-- Drop Subscription table
DROP TABLE IF EXISTS subscription;
DROP TABLE IF EXISTS Subscription;

-- Drop Notification table
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS Notification;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify tables are dropped
SHOW TABLES;
