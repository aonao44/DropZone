# DropZone - 推奨コマンド

## 開発コマンド

### 基本コマンド
```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# Linterの実行
npm run lint
```

## システムコマンド（macOS Darwin）

### ファイル操作
```bash
# ディレクトリ一覧表示
ls -la

# ファイル検索
find . -name "*.ts"

# 内容検索
grep -r "pattern" .

# ファイル移動・コピー
mv source dest
cp source dest

# ディレクトリ作成
mkdir -p path/to/dir
```

### Git操作
```bash
# 状態確認
git status

# ステージング
git add .

# コミット（コンベンショナルコミット形式）
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"

# プッシュ
git push origin main
```

### プロジェクト操作
```bash
# 依存関係のインストール
npm install

# 依存関係の更新確認
npm outdated

# 特定パッケージの更新
npm update package-name
```

## タスク完了時のチェックリスト

1. **コード品質チェック**
   ```bash
   npm run lint
   ```

2. **ビルドテスト**
   ```bash
   npm run build
   ```

3. **進捗記録**
   - `.claude/development_roadmap.md` の該当タスクを `[ ]` から `[x]` に更新

4. **Git コミット**
   ```bash
   git add .
   git commit -m "type: description"
   ```
