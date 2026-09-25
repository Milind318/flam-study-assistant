-- Run this once in MySQL Workbench (or `mysql -u root -p < schema.sql`)
-- It creates the database and the one table this app needs.

CREATE DATABASE IF NOT EXISTS flam_study_assistant;
USE flam_study_assistant;

CREATE TABLE IF NOT EXISTS sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  topic_input   TEXT NOT NULL,
  cards_json    JSON NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
