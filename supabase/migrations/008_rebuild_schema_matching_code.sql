-- Migration 008: コードと一致する統合スキーマ（クリーン再構築版）
--
-- 背景: 旧マイグレーション 001-007 は projects を (name/email/owner_id) で作るが、
-- 実コードは (client_name/client_email/user_id TEXT) を使うため、マイグレーションから
-- DB を再現できなかった（手動 ALTER で辻褄を合わせていた）。
-- このマイグレーションは、新規 Supabase プロジェクトに対して単体で流せば
-- 現行コードがそのまま動くスキーマを構築する。認証は Clerk 管理のため users/plans
-- テーブルは持たない（user_id は Clerk の TEXT を直接保持）。

-- ==========================================================
-- 0. 共通: updated_at 自動更新トリガー関数
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- 1. projects（Clerk userId を TEXT で保持）
-- ==========================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                 -- Clerk userId
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 2. submissions（提出の親レコード。従来の JSONB files も保持）
-- ==========================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  files JSONB DEFAULT '[]'::jsonb,
  figma_links JSONB DEFAULT '[]'::jsonb,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_slug ON submissions(project_slug);
CREATE INDEX IF NOT EXISTS idx_submissions_review_status ON submissions(review_status);

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 3. file_reviews（レガシー: JSONB files 方式の提出のファイル単位検収）
--    view/page.tsx が review_status/review_comment/is_deleted を参照するため維持
-- ==========================================================
CREATE TABLE IF NOT EXISTS file_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_index INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, file_index)
);

CREATE INDEX IF NOT EXISTS idx_file_reviews_submission_id ON file_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_file_reviews_review_status ON file_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_file_reviews_is_deleted ON file_reviews(is_deleted);

DROP TRIGGER IF EXISTS update_file_reviews_updated_at ON file_reviews;
CREATE TRIGGER update_file_reviews_updated_at
  BEFORE UPDATE ON file_reviews FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 4. project_slots（提出スロット = 指定席）
-- ==========================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_accept_type') THEN
    CREATE TYPE slot_accept_type AS ENUM (
      'IMAGE_SINGLE', 'IMAGE_MULTI', 'DOCUMENT', 'MEDIA', 'ANY'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS project_slots (
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

CREATE INDEX IF NOT EXISTS idx_project_slots_project_id ON project_slots(project_id);
CREATE INDEX IF NOT EXISTS idx_project_slots_sort_order ON project_slots(project_id, sort_order);

DROP TRIGGER IF EXISTS update_project_slots_updated_at ON project_slots;
CREATE TRIGGER update_project_slots_updated_at
  BEFORE UPDATE ON project_slots FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- 5. slot_files（スロットごとのファイル履歴・バージョン・検収）
-- ==========================================================
CREATE TABLE IF NOT EXISTS slot_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES project_slots(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by TEXT,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slot_files_slot_id ON slot_files(slot_id);
CREATE INDEX IF NOT EXISTS idx_slot_files_is_latest ON slot_files(is_latest) WHERE is_latest = TRUE;
CREATE INDEX IF NOT EXISTS idx_slot_files_version ON slot_files(slot_id, version);
CREATE INDEX IF NOT EXISTS idx_slot_files_submission ON slot_files(submission_id);

DROP TRIGGER IF EXISTS update_slot_files_updated_at ON slot_files;
CREATE TRIGGER update_slot_files_updated_at
  BEFORE UPDATE ON slot_files FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
