-- Migration: Add slots and file history system
-- Description: Implements project slots (designated upload areas) and file versioning

-- 1. Create accept_type ENUM
CREATE TYPE slot_accept_type AS ENUM (
  'IMAGE_SINGLE',   -- 画像1枚のみ（ロゴ、メイン画像用）
  'IMAGE_MULTI',    -- 画像複数枚OK（商品画像用）
  'DOCUMENT',       -- PDF, Docx など（原稿用）
  'MEDIA',          -- 動画・音声（素材用）
  'ANY'             -- 制限なし（その他用 - デフォルト）
);

-- 2. Create project_slots table
CREATE TABLE project_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  accept_type slot_accept_type NOT NULL DEFAULT 'ANY',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, name)
);

-- 3. Create slot_files table (file history per slot)
CREATE TABLE slot_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES project_slots(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,

  -- Version management
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,

  -- Review status (migrated from file_reviews)
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,

  -- Deletion management
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by TEXT,

  -- Submitter information
  submitted_by_name TEXT,
  submitted_by_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for slot_files
CREATE INDEX idx_slot_files_slot_id ON slot_files(slot_id);
CREATE INDEX idx_slot_files_is_latest ON slot_files(is_latest) WHERE is_latest = TRUE;
CREATE INDEX idx_slot_files_version ON slot_files(slot_id, version);
CREATE INDEX idx_slot_files_submission ON slot_files(submission_id);

-- 5. Create indexes for project_slots
CREATE INDEX idx_project_slots_project_id ON project_slots(project_id);
CREATE INDEX idx_project_slots_sort_order ON project_slots(project_id, sort_order);

-- 6. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_slots_updated_at
  BEFORE UPDATE ON project_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slot_files_updated_at
  BEFORE UPDATE ON slot_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Migration for existing projects: Add "その他" slot
-- This will be run after deployment to migrate existing data
-- INSERT INTO project_slots (project_id, name, is_required, accept_type, sort_order)
-- SELECT DISTINCT p.id, 'その他', false, 'ANY', 999
-- FROM projects p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM project_slots ps WHERE ps.project_id = p.id
-- );
