// レビューステータス（検品ワークフロー）
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionFile {
  id?: string;
  name: string;
  url: string;
  ufsUrl?: string; // v9互換用
}

// ファイル単位のレビュー情報
export interface FileReview {
  id?: string;
  submission_id: string;
  file_index: number;
  file_name: string;
  file_url: string;
  review_status: ReviewStatus;
  review_comment?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at?: string;
  updated_at?: string;
  // 論理削除用フィールド
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Submission {
  id?: string;
  name: string;
  email?: string;
  slug: string;
  project_slug?: string;
  submitted_at: string;
  files: SubmissionFile[];
  figma_links?: string[];
  // 検品ワークフロー用フィールド
  review_status?: ReviewStatus;
  review_comment?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  // ファイル単位のレビュー（結合時に追加）
  file_reviews?: FileReview[];
}

// UploadThingのレスポンス型
export interface UploadthingResponse {
  fileUrl: string;
  ufsUrl: string;
  fileName: string;
  key: string;
  url: string;
  name: string;
  size: number;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  name: string;
  email: string;
  created_at?: string;
  // スロットシステム用（結合時に追加）
  slots?: ProjectSlot[];
}

// スロット（指定席）システム
export type SlotAcceptType = 'IMAGE_SINGLE' | 'IMAGE_MULTI' | 'DOCUMENT' | 'MEDIA' | 'ANY';

export interface ProjectSlot {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  accept_type: SlotAcceptType;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  // 結合時に追加
  files?: SlotFile[];
  latest_file?: SlotFile;
}

export interface SlotFile {
  id: string;
  slot_id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  version: number;
  is_latest: boolean;
  review_status: ReviewStatus;
  review_comment?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  created_at?: string;
  updated_at?: string;
}

// スロット作成用の入力型
export interface SlotInput {
  name: string;
  description?: string;
  is_required: boolean;
  accept_type: SlotAcceptType;
  sort_order?: number;
}

// テンプレートキー
export type SlotTemplateKey = 'LP' | 'BANNER' | 'CUSTOM';

// ツーペイン仕分けUI用のファイル型
export interface FileWithId extends File {
  id: string; // UUIDで一意性確保
  uploadProgress?: number; // 0-100のアップロード進捗
  uploadedUrl?: string; // アップロード完了後のURL
}

// FileWithIdを生成するヘルパー関数
export function createFileWithId(file: File): FileWithId {
  return Object.assign(file, {
    id: crypto.randomUUID(),
  });
}
