import { SlotAcceptType } from './types';
import { ACCEPT_TYPE_CONFIG } from './slot-templates';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * ファイルのMIMEタイプがスロットの accept_type に適合するか検証
 */
export function validateFileType(
  file: { type: string; name: string },
  acceptType: SlotAcceptType
): ValidationResult {
  const config = ACCEPT_TYPE_CONFIG[acceptType];

  // ANY は全て許可
  if (acceptType === 'ANY' || config.mimeTypes.length === 0) {
    return { valid: true };
  }

  // ワイルドカード対応（video/*, audio/*）
  const isMatch = config.mimeTypes.some((allowed) => {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.replace('/*', '/');
      return file.type.startsWith(prefix);
    }
    return file.type === allowed;
  });

  if (!isMatch) {
    return {
      valid: false,
      error: `このスロットには${config.label}のみアップロードできます（${file.name}）`,
    };
  }

  return { valid: true };
}

/**
 * ファイル数がスロットの制限に適合するか検証
 */
export function validateFileCount(
  fileCount: number,
  acceptType: SlotAcceptType
): ValidationResult {
  const config = ACCEPT_TYPE_CONFIG[acceptType];

  if (!config.multiple && fileCount > 1) {
    return {
      valid: false,
      error: 'このスロットには1ファイルのみアップロードできます',
    };
  }

  return { valid: true };
}

/**
 * 複数ファイルの種類を一括検証
 */
export function validateFiles(
  files: { type: string; name: string }[],
  acceptType: SlotAcceptType
): ValidationResult {
  // ファイル数チェック
  const countResult = validateFileCount(files.length, acceptType);
  if (!countResult.valid) {
    return countResult;
  }

  // 各ファイルの種類チェック
  for (const file of files) {
    const typeResult = validateFileType(file, acceptType);
    if (!typeResult.valid) {
      return typeResult;
    }
  }

  return { valid: true };
}

/**
 * MIMEタイプからファイル種類のカテゴリを判定
 */
export function getFileCategory(mimeType: string): 'image' | 'document' | 'media' | 'other' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return 'media';
  }
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType === 'text/plain'
  ) {
    return 'document';
  }
  return 'other';
}

/**
 * accept_type に基づいて許可されるファイルカテゴリを取得
 */
export function getAllowedCategories(acceptType: SlotAcceptType): string[] {
  switch (acceptType) {
    case 'IMAGE_SINGLE':
    case 'IMAGE_MULTI':
      return ['image'];
    case 'DOCUMENT':
      return ['document'];
    case 'MEDIA':
      return ['media'];
    case 'ANY':
    default:
      return ['image', 'document', 'media', 'other'];
  }
}
