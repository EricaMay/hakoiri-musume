# Cloudflare Pages デプロイ手順

## 概要
Cloudflare Pages の GitHub 連携を使い、`main` ブランチへの push で自動ビルド・デプロイする。

## 前提
- GitHub リポジトリ: https://github.com/EricaMay/hakoiri-musume
- Cloudflare アカウント登録済み

## 初回セットアップ手順

### 1. Cloudflare Dashboard にログイン
https://dash.cloudflare.com/

### 2. Pages プロジェクト作成
1. 左メニュー「Workers & Pages」→「Create」
2. 「Pages」タブ → 「Connect to Git」
3. GitHub アカウントを連携（初回のみ）
4. リポジトリ一覧から **hakoiri-musume** を選択

### 3. ビルド設定
| 項目 | 値 |
|------|-----|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |

> **「Deploy command」欄が表示された場合**: **空欄のままでOK**。  
> GitHub 連携の場合、ビルド後のデプロイは Cloudflare が自動で行うため、別途デプロイコマンドは不要。

> **注意**: Node.js バージョンが古い場合はビルドに失敗する。  
> 環境変数に `NODE_VERSION=20` を設定すれば OK。

### 4. デプロイ実行
「Save and Deploy」をクリック → 初回ビルドが走り、完了後に URL が発行される。

### 5. 公開 URL
- `https://hakoiri-musume.pages.dev`（自動付与）
- カスタムドメインは Dashboard の「Custom domains」から設定可能

## 以降の運用
- `main` ブランチに push するだけで自動デプロイ
- プレビュー: PR を作ると自動でプレビュー URL が生成される

## ローカルでの動作確認
```bash
npm run build    # dist/ にビルド出力
npm run preview  # ローカルでプレビュー（http://localhost:4173）
```

## トラブルシューティング

### ビルド失敗: Node.js バージョン
Cloudflare Pages のビルド環境で Node バージョンが合わない場合:
- Settings → Environment Variables に `NODE_VERSION` = `20` を追加

### package-lock.json がない
Cloudflare Pages は `npm ci` を使うため `package-lock.json` が必要。
このプロジェクトではリポに含まれているので問題なし。
