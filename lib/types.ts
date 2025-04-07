export interface SubmissionFile {
  id?: string;
  name: string;
  url: string;
  ufsUrl?: string; // v9互換用
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
