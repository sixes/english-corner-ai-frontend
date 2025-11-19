-- Supabase Schema for English Corner Sessions
-- Run this in Supabase SQL Editor

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  max_participants INTEGER DEFAULT 14,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_cancelled BOOLEAN DEFAULT FALSE
);

-- Session signups table (many-to-many between users and sessions)
CREATE TABLE IF NOT EXISTS session_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_gender VARCHAR(50),
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_session_signups_session_id ON session_signups(session_id);
CREATE INDEX IF NOT EXISTS idx_session_signups_user_id ON session_signups(user_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_signups ENABLE ROW LEVEL SECURITY;

-- Policies for sessions table
-- Anyone can view sessions
CREATE POLICY "Anyone can view sessions" ON sessions
  FOR SELECT USING (true);

-- Authenticated users can create sessions
CREATE POLICY "Authenticated users can create sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = created_by);

-- Policies for session_signups table
-- Anyone can view signups
CREATE POLICY "Anyone can view signups" ON session_signups
  FOR SELECT USING (true);

-- Authenticated users can sign up
CREATE POLICY "Authenticated users can sign up" ON session_signups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own signups
CREATE POLICY "Users can cancel own signups" ON session_signups
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
