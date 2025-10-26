-- DropZone MVP データベーススキーマ
-- このマイグレーションでは、完全なMVPスキーマを作成します

-- ====================
-- 1. Users テーブル
-- ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ====================
-- 2. Projects テーブルの拡張
-- ====================
-- 既存のprojectsテーブルがある場合は、カラムを追加
-- 既存テーブルがない場合は新規作成

-- まず既存テーブルを確認して、ない場合は作成
DO $create_projects$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'projects') THEN
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMPTZ,
      template_type TEXT CHECK (template_type IN ('LP', 'CORP', 'BANNER')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $create_projects$;

-- 既存テーブルに不足しているカラムを追加
DO $add_projects_columns$
BEGIN
  -- owner_id カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- description カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'description'
  ) THEN
    ALTER TABLE projects ADD COLUMN description TEXT;
  END IF;

  -- due_date カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN due_date TIMESTAMPTZ;
  END IF;

  -- template_type カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'template_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN template_type TEXT CHECK (template_type IN ('LP', 'CORP', 'BANNER'));
  END IF;

  -- status カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'));
  END IF;

  -- updated_at カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $add_projects_columns$;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ====================
-- 3. Submissions テーブルの拡張
-- ====================
-- 既存のsubmissionsテーブルがある場合は、カラムを追加

DO $create_submissions$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'submissions') THEN
    CREATE TABLE submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      project_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete')),
      progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
      files JSONB DEFAULT '[]'::jsonb,
      figma_links JSONB DEFAULT '[]'::jsonb,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $create_submissions$;

-- 既存テーブルに不足しているカラムを追加
DO $add_submissions_columns$
BEGIN
  -- project_slug カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'project_slug'
  ) THEN
    ALTER TABLE submissions ADD COLUMN project_slug TEXT NOT NULL DEFAULT '';
  END IF;

  -- project_id カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE submissions ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- status カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'status'
  ) THEN
    ALTER TABLE submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete'));
  END IF;

  -- progress_pct カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'progress_pct'
  ) THEN
    ALTER TABLE submissions ADD COLUMN progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100);
  END IF;

  -- updated_at カラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE submissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $add_submissions_columns$;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_slug ON submissions(project_slug);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ====================
-- 4. Assets テーブル
-- ====================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('logo', 'kv', 'figma', 'guide', 'other')),
  file_key TEXT,
  file_url TEXT,
  width INTEGER,
  height INTEGER,
  bytes BIGINT,
  ext TEXT,
  is_valid BOOLEAN DEFAULT true,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_assets_submission_id ON assets(submission_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- ====================
-- 5. Events テーブル（監査ログ）
-- ====================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'submitted', 'reminded', 'downloaded', 'validation_error', 'other')),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_submission_id ON events(submission_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- ====================
-- 6. Plans テーブル（課金管理）
-- ====================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_sub_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_tier ON plans(tier);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);

-- ====================
-- 7. トリガー：updated_at自動更新
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$ language 'plpgsql';

-- usersテーブル
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- projectsテーブル
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- submissionsテーブル
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- plansテーブル
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 8. RLS（Row Level Security）の設定
-- ====================
-- 開発中は一旦無効化、本番では有効化を検討

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- ====================
-- 完了
-- ====================
