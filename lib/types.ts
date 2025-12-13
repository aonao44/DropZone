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
}
