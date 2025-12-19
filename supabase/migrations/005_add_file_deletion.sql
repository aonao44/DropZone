-- Migration: Add soft delete capability for file_reviews
-- Allows submitters and project owners to logically delete files
-- Physical storage (UploadThing) is retained

-- 1. Add is_deleted column
DO $add_is_deleted$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'file_reviews' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE file_reviews ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
  END IF;
END $add_is_deleted$;

-- 2. Add deleted_at timestamp
DO $add_deleted_at$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'file_reviews' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE file_reviews ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $add_deleted_at$;

-- 3. Add deleted_by (Clerk user_id or submitter identifier)
DO $add_deleted_by$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'file_reviews' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE file_reviews ADD COLUMN deleted_by TEXT;
  END IF;
END $add_deleted_by$;

-- 4. Add index for efficient querying of non-deleted files
CREATE INDEX IF NOT EXISTS idx_file_reviews_is_deleted ON file_reviews(is_deleted);
