-- Reset Database Script
-- Run this in MySQL to completely reset the database

-- Drop the database if it exists
DROP DATABASE IF EXISTS student_management_db;

-- Create a fresh database
CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify database was created
SHOW DATABASES LIKE 'student_management_db';

-- Switch to the database
USE student_management_db;

-- Show that it's empty
SHOW TABLES;
