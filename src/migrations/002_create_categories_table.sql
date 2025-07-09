-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read categories (public data)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Policy: Only authenticated users can create categories (optional, can be restricted further)
CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 