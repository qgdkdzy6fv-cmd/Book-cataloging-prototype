/*
  # Create books table

  1. New Tables
    - `books`
      - `id` (uuid, primary key) - Unique identifier for the book
      - `user_id` (uuid, nullable) - Reference to auth.users, null for guest users
      - `catalog_id` (uuid, not null) - Reference to catalogs table
      - `title` (text, not null) - Book title
      - `author` (text, not null) - Book author
      - `genre` (text, nullable) - Book genre
      - `holiday_category` (text, nullable) - Holiday category if applicable
      - `cover_image_url` (text, nullable) - URL to book cover image
      - `isbn` (text, nullable) - ISBN number
      - `publication_year` (integer, nullable) - Year of publication
      - `description` (text, nullable) - Book description
      - `tags` (text[], default empty array) - Array of tags
      - `is_manually_edited` (boolean, default false) - Whether book was manually edited
      - `is_favorite` (boolean, default false) - Favorite status
      - `is_read` (boolean, default false) - Read status
      - `created_at` (timestamptz, default now()) - Creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp
      
  2. Security
    - Enable RLS on `books` table
    - Add policy for authenticated users to manage their own books
    - Books are tied to catalogs which are tied to users
    
  3. Indexes
    - Index on user_id for faster queries
    - Index on catalog_id for faster queries
    - Index on title for search functionality
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES catalogs(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  genre text,
  holiday_category text,
  cover_image_url text,
  isbn text,
  publication_year integer,
  description text,
  tags text[] DEFAULT '{}' NOT NULL,
  is_manually_edited boolean DEFAULT false NOT NULL,
  is_favorite boolean DEFAULT false NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_catalog_id ON books(catalog_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

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
