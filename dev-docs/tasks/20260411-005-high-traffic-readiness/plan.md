# Implementation Plan

## 方針
3つの改善を1タスクで実施する。全て静的ファイルの変更のみ（コードロジック変更なし）。

## 手順

### Step 1: CSP 修正（`public/_headers`）
- `script-src` に `https://static.cloudflareinsights.com` を追加
- `connect-src` に `https://cloudflareinsights.com` を追加（ビーコン送信先）
- 他のドメインは引き続きブロック

### Step 2: キャッシュヘッダー追加（`public/_headers`）
- `/assets/*` パスに `Cache-Control: public, max-age=31536000, immutable` を設定
- ルート（`/*`）はデフォルトのまま（Cloudflare が適切に処理）

### Step 3: OGP メタタグ追加（`index.html`）
- `og:title`: 箱入り娘
- `og:description`: Klotski系スライディングブロックパズル
- `og:type`: website
- `og:image`: OGP画像（SVG は OGP非対応のため、PNG を生成するか placeholder を使用）
- `twitter:card`: summary

### 前提
- OGP画像は placeholder テキスト or 既存 icon.svg を参照する簡易対応とする
  - 本格的な OGP 画像デザインは別タスクで対応可能
- `og:url` はデプロイ URL が確定してから設定（現時点では省略）

## 検証
- `npm run build` 成功
- `dist/_headers` にキャッシュ設定が含まれること
- `dist/index.html` に OGP タグが含まれること
