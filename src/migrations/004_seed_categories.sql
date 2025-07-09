-- Seed initial categories
INSERT INTO categories (name, description) VALUES
  ('Technology', 'Ideas related to software, hardware, and digital innovation'),
  ('Business', 'Entrepreneurial ideas, business models, and commercial ventures'),
  ('Education', 'Learning, teaching, and educational system improvements'),
  ('Health & Wellness', 'Medical, fitness, mental health, and wellness innovations'),
  ('Environment', 'Sustainability, climate change, and environmental solutions'),
  ('Social Impact', 'Ideas to improve society, communities, and social issues'),
  ('Entertainment', 'Games, media, arts, and entertainment concepts'),
  ('Travel & Lifestyle', 'Travel experiences, lifestyle improvements, and personal development'),
  ('Food & Beverage', 'Culinary innovations, restaurants, and food-related ideas'),
  ('Other', 'Ideas that don''t fit into the above categories')
ON CONFLICT (name) DO NOTHING; 