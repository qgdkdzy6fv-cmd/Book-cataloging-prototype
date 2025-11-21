# Database Setup Instructions

This application uses Supabase for cloud storage when users are signed in. Follow these steps to set up the database schema.

## Setting Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to the SQL Editor
3. Copy and paste the SQL code below into the SQL Editor
4. Click "Run" to execute the migration

## Database Migration SQL

```sql
-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  genre text,
  holiday_category text,
  cover_image_url text,
  isbn text,
  publication_year integer,
  description text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_manually_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_view text DEFAULT 'grid',
  items_per_page integer DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_holiday_category ON books(holiday_category);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING gin(tags);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books table
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences table
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Configuring Authentication

1. In your Supabase project dashboard, go to Authentication > Providers
2. Ensure Email authentication is enabled
3. For development, you may want to disable email confirmation:
   - Go to Authentication > Settings
   - Uncheck "Enable email confirmations"

## Getting Your Environment Variables

1. In your Supabase project, go to Settings > API
2. Copy your Project URL and save it as `VITE_SUPABASE_URL` in your `.env` file
3. Copy your `anon` public key and save it as `VITE_SUPABASE_ANON_KEY` in your `.env` file

Your `.env` file should look like:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing the Setup

1. Start your development server
2. Try signing up with a test email and password
3. Add a book and verify it appears after refreshing the page
4. Sign out and sign back in to verify data persistence

## Guest Mode

The application also works without authentication using local browser storage. This is perfect for testing or for users who don't want to create an account. Data stored in guest mode remains only in the browser's local storage and is not synced across devices.
