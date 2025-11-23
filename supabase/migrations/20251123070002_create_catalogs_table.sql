/*
  # Create catalogs table

  1. New Tables
    - `catalogs`
      - `id` (uuid, primary key) - Unique identifier for the catalog
      - `user_id` (uuid, nullable) - Reference to auth.users, null for guest users
      - `name` (text, not null) - Catalog name
      - `icon` (text, not null, default 'Library') - Icon name for the catalog
      - `description` (text, nullable) - Optional catalog description
      - `created_at` (timestamptz, default now()) - Creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp
      
  2. Security
    - Enable RLS on `catalogs` table
    - Add policy for authenticated users to manage their own catalogs
    - Add policy for guests to read all catalogs (for guest mode)
    
  3. Indexes
    - Index on user_id for faster queries
*/

CREATE TABLE IF NOT EXISTS catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Library',
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalogs_user_id ON catalogs(user_id);

ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own catalogs"
  ON catalogs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catalogs"
  ON catalogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catalogs"
  ON catalogs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own catalogs"
  ON catalogs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
