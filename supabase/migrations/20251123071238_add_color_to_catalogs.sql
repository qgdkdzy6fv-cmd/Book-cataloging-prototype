/*
  # Add color field to catalogs table

  1. Changes
    - Add `color` column to `catalogs` table with default value 'Blue'
    - Set NOT NULL constraint after adding default
    
  2. Notes
    - All existing catalogs will have 'Blue' as their default color
    - The color field stores the name of the color (e.g., 'Blue', 'Green', 'Red')
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'catalogs' AND column_name = 'color'
  ) THEN
    ALTER TABLE catalogs ADD COLUMN color text DEFAULT 'Blue' NOT NULL;
  END IF;
END $$;
