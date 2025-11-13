-- Change user_id column from UUID to TEXT to support Clerk user IDs
-- Clerk user IDs are strings like "user_35KJ29g1gUm4bkMq1qh1viYr1Hd"

-- Drop the foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_user_id_fkey'
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT projects_user_id_fkey;
  END IF;
END $$;

-- Change the column type from UUID to TEXT
ALTER TABLE projects
ALTER COLUMN user_id TYPE TEXT;

-- Recreate index
DROP INDEX IF EXISTS idx_projects_user_id;
CREATE INDEX idx_projects_user_id ON projects(user_id);
