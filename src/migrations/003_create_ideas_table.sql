-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category_id ON ideas(category_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read ideas (public data)
CREATE POLICY "Anyone can view ideas" ON ideas
  FOR SELECT USING (true);

-- Policy: Users can create their own ideas
CREATE POLICY "Users can create own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own ideas
CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own ideas
CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid()::text = user_id::text); 