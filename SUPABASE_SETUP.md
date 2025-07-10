# Supabase Setup Guide

This project uses Supabase as the backend database and authentication provider.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `ai-idea-generator` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to you
4. Wait for the project to be created (this takes a few minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Service role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Update Environment Variables

Update your `.env` file with your actual Supabase credentials:

```env
PORT=8080

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 4. Run Database Migrations

Execute the SQL files in the `src/migrations/` directory in your Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Run each migration file in order:
   - `001_create_users_table.sql`
   - `002_create_categories_table.sql`
   - `003_create_ideas_table.sql`
   - `004_seed_categories.sql`

### Alternative: Copy and paste the SQL

You can copy the contents of each migration file and paste them into the SQL Editor, then click "Run".

## 5. Verify Setup

After running the migrations, you should see:
- **Tables**: `users`, `categories`, `ideas`
- **Seed Data**: 10 categories in the `categories` table
- **Policies**: Row Level Security policies are enabled

## 6. Test the Connection

Run your application:
```bash
npm start
```

The application should start without errors if the Supabase connection is properly configured.

## Database Schema

### Users Table
- `id`: Primary key (BIGSERIAL)
- `email`: Unique email address
- `password_hash`: Hashed password
- `created_at`, `updated_at`: Timestamps

### Categories Table
- `id`: Primary key (BIGSERIAL)
- `name`: Category name (unique)
- `description`: Category description
- `created_at`, `updated_at`: Timestamps

### Ideas Table
- `id`: Primary key (BIGSERIAL)
- `title`: Idea title
- `description`: Idea description
- `user_id`: Foreign key to users table
- `category_id`: Foreign key to categories table
- `created_at`, `updated_at`: Timestamps

## Security Features

- **Row Level Security (RLS)** is enabled on all tables
- **Policies** ensure users can only access their own data
- **Categories** are publicly readable
- **Ideas** are publicly readable but only editable by their creators 