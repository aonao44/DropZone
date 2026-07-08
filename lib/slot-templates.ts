import { SlotAcceptType, SlotInput, SlotTemplateKey } from './types';

/**
 * accept_type ごとの設定
 * - label: UI表示用ラベル
 * - accept: input要素のaccept属性
 * - mimeTypes: サーバー側バリデーション用MIMEタイプ
 * - multiple: 複数ファイル許可フラグ
 */
export const ACCEPT_TYPE_CONFIG: Record<SlotAcceptType, {
  label: string;
  accept: string;
  mimeTypes: string[];
  multiple: boolean;
}> = {
  IMAGE_SINGLE: {
    label: '画像（1枚）',
    accept: 'image/*',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    multiple: false,
  },
  IMAGE_MULTI: {
    label: '画像（複数）',
    accept: 'image/*',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    multiple: true,
  },
  DOCUMENT: {
    label: 'ドキュメント',
    accept: '.pdf,.doc,.docx,.txt',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    multiple: true,
  },
  MEDIA: {
    label: '動画・音声',
    accept: 'video/*,audio/*',
    mimeTypes: ['video/*', 'audio/*'],
    multiple: true,
  },
  ANY: {
    label: '制限なし',
    accept: '*/*',
    mimeTypes: [],
    multiple: true,
  },
};

/**
 * accept_type の選択肢（UI用）
 */
export const ACCEPT_TYPE_OPTIONS: { value: SlotAcceptType; label: string; icon: string }[] = [
  { value: 'IMAGE_SINGLE', label: '画像（1枚のみ）', icon: '📷' },
  { value: 'IMAGE_MULTI', label: '画像（複数可）', icon: '🖼️' },
  { value: 'DOCUMENT', label: 'ドキュメント', icon: '📄' },
  { value: 'MEDIA', label: '動画・音声', icon: '🎬' },
  { value: 'ANY', label: '制限なし', icon: '📁' },
];

/**
 * スロットテンプレート定義
 */
export const SLOT_TEMPLATES: Record<SlotTemplateKey, {
  name: string;
  description: string;
  slots: SlotInput[];
}> = {
  LP: {
    name: 'LP用',
    description: 'ランディングページ制作に必要な素材一式',
    slots: [
      { name: 'ロゴ', is_required: true, accept_type: 'IMAGE_SINGLE', sort_order: 0 },
      { name: 'メインビジュアル', is_required: true, accept_type: 'IMAGE_SINGLE', sort_order: 1 },
      { name: 'OGP画像', is_required: false, accept_type: 'IMAGE_SINGLE', sort_order: 2 },
      { name: 'ファビコン', is_required: false, accept_type: 'IMAGE_SINGLE', sort_order: 3 },
    ],
  },
  BANNER: {
    name: 'バナー用',
    description: '広告バナー制作用',
    slots: [
      { name: 'バナー画像', is_required: true, accept_type: 'IMAGE_MULTI', sort_order: 0 },
    ],
  },
  CUSTOM: {
    name: 'カスタム',
    description: '自由にスロットを設定',
    slots: [
      { name: 'その他', is_required: false, accept_type: 'ANY', sort_order: 0 },
    ],
  },
};

/**
 * テンプレートの選択肢（UI用）
 */
export const TEMPLATE_OPTIONS: { value: SlotTemplateKey; label: string; description: string }[] = [
  { value: 'LP', label: 'LP用', description: 'ロゴ、メインビジュアル、OGP、ファビコン' },
  { value: 'BANNER', label: 'バナー用', description: 'バナー画像（複数可）' },
  { value: 'CUSTOM', label: 'カスタム', description: '自由にスロットを設定' },
];

/**
 * テンプレートからスロット配列を生成
 */
export function getSlotsFromTemplate(templateKey: SlotTemplateKey): SlotInput[] {
  const template = SLOT_TEMPLATES[templateKey];
  return template.slots.map((slot, index) => ({
    ...slot,
    sort_order: slot.sort_order ?? index,
  }));
}

/**
 * デフォルトのスロット（既存プロジェクト移行用）
 */
export const DEFAULT_MIGRATION_SLOT: SlotInput = {
  name: 'その他',
  is_required: false,
  accept_type: 'ANY',
  sort_order: 999,
};
