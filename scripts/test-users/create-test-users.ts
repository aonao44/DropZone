/**
 * テストユーザー作成スクリプト
 *
 * このスクリプトは5人のテストユーザーをClerkに作成します。
 * Clerk Management APIを使用してユーザーを作成します。
 *
 * 使用方法:
 * npx tsx scripts/test-users/create-test-users.ts
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { Clerk } from '@clerk/clerk-sdk-node'

// .env.localを読み込む
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Clerk SDKの初期化
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

// テストユーザーデータ
const testUsers = [
  {
    firstName: '太郎',
    lastName: '田中',
    emailAddress: 'tanaka.taro@test-dropzone.local',
    password: 'TestPassword123!',
  },
  {
    firstName: '花子',
    lastName: '佐藤',
    emailAddress: 'sato.hanako@test-dropzone.local',
    password: 'TestPassword123!',
  },
  {
    firstName: '一郎',
    lastName: '鈴木',
    emailAddress: 'suzuki.ichiro@test-dropzone.local',
    password: 'TestPassword123!',
  },
  {
    firstName: '美咲',
    lastName: '高橋',
    emailAddress: 'takahashi.misaki@test-dropzone.local',
    password: 'TestPassword123!',
  },
  {
    firstName: '健太',
    lastName: '渡辺',
    emailAddress: 'watanabe.kenta@test-dropzone.local',
    password: 'TestPassword123!',
  },
]

async function createTestUsers() {
  console.log('🚀 テストユーザーの作成を開始します...\n')

  for (const [index, userData] of testUsers.entries()) {
    try {
      console.log(`[${index + 1}/5] ${userData.lastName} ${userData.firstName} (${userData.emailAddress}) を作成中...`)

      const user = await clerk.users.createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailAddress: [userData.emailAddress],
        password: userData.password,
        skipPasswordChecks: true,
        skipPasswordRequirement: false,
      })

      console.log(`✅ 成功: User ID = ${user.id}\n`)
    } catch (error: any) {
      if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
        console.log(`⚠️  スキップ: このメールアドレスは既に登録されています\n`)
      } else {
        console.error(`❌ エラー: ${error.message}\n`)
      }
    }
  }

  console.log('✨ テストユーザーの作成が完了しました！')
  console.log('\n📝 ログイン情報:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.lastName} ${user.firstName}`)
    console.log(`   Email: ${user.emailAddress}`)
    console.log(`   Pass:  ${user.password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  })
}

createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('致命的エラー:', error)
    process.exit(1)
  })
