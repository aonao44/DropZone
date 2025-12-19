-- 既存データをスロットベースに移行するスクリプト
-- このスクリプトは既存のプロジェクトに「その他」スロットを作成し、
-- 既存のファイルをそのスロットに移行します。

-- 1. スロットを持たない既存プロジェクトに「その他」スロットを作成
INSERT INTO project_slots (project_id, name, is_required, accept_type, sort_order)
SELECT
  p.id as project_id,
  'その他' as name,
  FALSE as is_required,
  'ANY' as accept_type,
  0 as sort_order
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM project_slots ps WHERE ps.project_id = p.id
);

-- 2. 既存のsubmissionsからファイルをslot_filesに移行
-- 注意: これは各提出の files JSONB 配列からファイルを抽出し、
-- 対応するプロジェクトの「その他」スロットに関連付けます

-- 既存ファイルを一時テーブルに展開
WITH expanded_files AS (
  SELECT
    s.id as submission_id,
    s.project_slug,
    s.name as submitter_name,
    s.email as submitter_email,
    s.created_at as submitted_at,
    (f->>'name') as file_name,
    (f->>'url') as file_url,
    row_number() OVER (PARTITION BY s.id ORDER BY ordinality) as file_index
  FROM submissions s,
       jsonb_array_elements(COALESCE(s.files, '[]'::jsonb)) WITH ORDINALITY AS t(f, ordinality)
  WHERE jsonb_array_length(COALESCE(s.files, '[]'::jsonb)) > 0
),
-- 各ファイルに対応するスロットIDを取得
files_with_slots AS (
  SELECT
    ef.*,
    ps.id as slot_id
  FROM expanded_files ef
  JOIN projects p ON p.slug = ef.project_slug
  JOIN project_slots ps ON ps.project_id = p.id AND ps.name = 'その他'
)
-- slot_filesに挿入（重複を避けるためNOT EXISTSで確認）
INSERT INTO slot_files (
  slot_id,
  submission_id,
  file_name,
  file_url,
  version,
  is_latest,
  review_status,
  submitted_by_name,
  submitted_by_email,
  created_at
)
SELECT
  fs.slot_id,
  fs.submission_id,
  fs.file_name,
  fs.file_url,
  fs.file_index as version,
  CASE WHEN fs.file_index = 1 THEN TRUE ELSE FALSE END as is_latest,
  'pending' as review_status,
  fs.submitter_name,
  fs.submitter_email,
  fs.submitted_at
FROM files_with_slots fs
WHERE NOT EXISTS (
  SELECT 1 FROM slot_files sf
  WHERE sf.submission_id = fs.submission_id
    AND sf.file_url = fs.file_url
);

-- file_reviewsの情報をslot_filesに反映
UPDATE slot_files sf
SET
  review_status = fr.review_status,
  review_comment = fr.review_comment,
  reviewed_at = fr.reviewed_at,
  reviewed_by = fr.reviewed_by,
  is_deleted = COALESCE(fr.is_deleted, FALSE),
  deleted_at = fr.deleted_at,
  deleted_by = fr.deleted_by
FROM file_reviews fr
JOIN submissions s ON s.id = fr.submission_id
WHERE sf.submission_id = fr.submission_id
  AND sf.file_name = (
    SELECT (s2.files->fr.file_index->>'name')
    FROM submissions s2
    WHERE s2.id = fr.submission_id
  );

-- 3. is_latestフラグを修正（各スロット内で最新バージョンのみTRUEに）
-- まず全てをFALSEにリセット
UPDATE slot_files SET is_latest = FALSE;

-- 各スロット内で最も新しい非削除ファイルをis_latest=TRUEに
UPDATE slot_files sf
SET is_latest = TRUE
WHERE sf.id IN (
  SELECT DISTINCT ON (slot_id) id
  FROM slot_files
  WHERE is_deleted = FALSE
  ORDER BY slot_id, version DESC, created_at DESC
);

-- 確認用: 移行結果のサマリ
-- SELECT
--   'Projects with slots' as metric,
--   COUNT(DISTINCT project_id) as count
-- FROM project_slots
-- UNION ALL
-- SELECT
--   'Migrated slot files' as metric,
--   COUNT(*) as count
-- FROM slot_files;
