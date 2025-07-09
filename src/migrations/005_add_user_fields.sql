-- Add missing fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Create an index on is_verified for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Update RLS policies to handle the new fields
-- Policy: Users can insert their own records during registration
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (true);  -- Allow registration for anyone

-- Note: The existing policies for SELECT and UPDATE will automatically 
-- include the new fields since they use SELECT * pattern 