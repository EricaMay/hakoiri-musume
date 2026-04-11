# Task: 公開準備・高トラフィック対策

## 背景
アプリ公開時にバズが発生しても問題ない構成を整える。
アーキテクチャは既に「完全静的配信 + クライアントサイド処理」で強いが、
細かい設定面で改善可能な点が見つかった。

## 要件

### 1. CSP修正（Cloudflare Analytics 許可）
- 現在の `script-src 'self'` が CF Analytics (`static.cloudflareinsights.com`) をブロックしている可能性
- CSP を修正し Analytics が正常に動作するようにする

### 2. キャッシュヘッダー最適化
- ハッシュ付きアセット（`/assets/*`）に長期キャッシュ（`immutable`）を設定
- CDN ヒット率を向上させる

### 3. OGP メタタグ追加
- SNS シェア時にプレビューが表示されるよう `og:title`, `og:description`, `og:image` を設定
- Twitter Card も設定

## 対象ファイル
- `public/_headers`
- `index.html`
- OGP画像（必要に応じて作成）

## 完了条件
- CSP が CF Analytics を許可しつつ、不要なドメインは引き続きブロック
- ハッシュ付きアセットに `Cache-Control: public, max-age=31536000, immutable` が設定される
- OGP メタタグが `index.html` に含まれる
- `npm run build` が成功する
