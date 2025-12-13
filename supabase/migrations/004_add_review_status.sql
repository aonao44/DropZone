-- Migration: Add review status for inspection workflow
-- This adds the approval/rejection workflow as defined in requirements_v02.md

-- 1. Add review_status to submissions table
-- Values: 'pending' (🟡確認待ち), 'approved' (🟢承認), 'rejected' (🟣差戻し)
DO $add_review_status$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE submissions ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (review_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $add_review_status$;

CREATE INDEX IF NOT EXISTS idx_submissions_review_status ON submissions(review_status);

-- 2. Create file_reviews table for individual file approval/rejection
-- Each file can be approved or rejected with a comment
CREATE TABLE IF NOT EXISTS file_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_index INTEGER NOT NULL, -- Index in the files JSONB array
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_comment TEXT, -- Required when rejecting (enforced in application)
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT, -- Clerk user_id of the reviewer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique file per submission
  UNIQUE(submission_id, file_index)
);

CREATE INDEX IF NOT EXISTS idx_file_reviews_submission_id ON file_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_file_reviews_review_status ON file_reviews(review_status);

-- 3. Add trigger for updated_at
DROP TRIGGER IF EXISTS update_file_reviews_updated_at ON file_reviews;
CREATE TRIGGER update_file_reviews_updated_at
BEFORE UPDATE ON file_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Add review_comment to submissions for overall rejection comment
DO $add_review_comment$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'review_comment'
  ) THEN
    ALTER TABLE submissions ADD COLUMN review_comment TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE submissions ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE submissions ADD COLUMN reviewed_by TEXT;
  END IF;
END $add_review_comment$;
