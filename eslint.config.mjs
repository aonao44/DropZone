import nextConfig from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      // React Compiler 世代の新ルール。SSR 安全のための正当なパターン
      // （localStorage 復元・外部システム同期）も検知するため移行期間は warn
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // shadcn/ui のベンダーコードは直接編集しない（更新追従性を優先）
    files: ['components/ui/**', 'hooks/use-mobile.ts'],
    rules: {
      'react-hooks/purity': 'warn',
    },
  },
]

export default eslintConfig
