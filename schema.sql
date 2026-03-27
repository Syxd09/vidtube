-- VidTube AI Professional Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  author_name TEXT,
  thumbnail TEXT,
  summary TEXT NOT NULL,
  overview TEXT,
  sentiment TEXT,
  views TEXT,
  publish_date TEXT,
  key_points JSONB NOT NULL,
  transcript JSONB NOT NULL,
  tags JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
