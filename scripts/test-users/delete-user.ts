/**
 * 特定ユーザー削除スクリプト
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { createClerkClient } from '@clerk/backend'

// .env.localを読み込む
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Clerk SDKの初期化
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

async function deleteUser() {
  const emailToDelete = 'aokinao44@gmail.com' // 青木 直樹のメールアドレス

  console.log(`🔍 ユーザーを検索中: ${emailToDelete}\n`)

  try {
    // メールアドレスでユーザーを検索
    const { data: users } = await clerk.users.getUserList({
      emailAddress: [emailToDelete],
    })

    console.log('検索結果:', users)

    if (!users || users.length === 0) {
      console.log('⚠️  ユーザーが見つかりませんでした')
      return
    }

    const user = users[0]
    console.log(`✓ ユーザーを発見: ${user.firstName} ${user.lastName} (${user.id})`)
    console.log(`🗑️  削除中...\n`)

    await clerk.users.deleteUser(user.id)
    console.log('✅ ユーザーを削除しました！')
  } catch (error: any) {
    console.error('❌ エラー:', error)
  }
}

deleteUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('致命的エラー:', error)
    process.exit(1)
  })
