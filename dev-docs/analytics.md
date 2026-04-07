# アクセス計測: Cloudflare Web Analytics

## 採用: Cloudflare Web Analytics

### 選定理由（比較検討）

| 手段 | Cookie | 費用 | 設定コスト | 備考 |
|------|--------|------|-----------|------|
| **Cloudflare Web Analytics** ✅ | 不要 | 無料 | 低（JS スニペットを index.html に追加） | Pages と同一ダッシュボード。プライバシーフレンドリー |
| Cloudflare Pages 組み込み（リクエスト数） | 不要 | 無料 | ゼロ | Workers & Pages > Metrics に自動表示。ページビュー単位ではなく CDN リクエスト数のみ |
| Google Analytics 4 | 必要 | 無料 | 中（GDPR対応等） | 高機能だが Cookie 同意バナーが必要。個人ゲームサイトには過剰 |
| Plausible / Fathom 等 | 不要 | 有料（SaaS）/ 無料（self-host） | 中〜高 | プライバシー優秀だが費用か運用コストがかかる |

**Cloudflare Web Analytics** を採用。理由:
- JS スニペットを `index.html` に1行追加するだけで導入できる
- Cookie 不要・IP 非保存でプライバシー配慮が高い
- 同一ダッシュボードで管理できる
- 個人ゲームサイトの規模では十分な指標が揃っている

---

## 設定手順

> **補足**: このサイトは Cloudflare Workers の静的アセット形式でデプロイされているため、
> Workers & Pages の Metrics タブに「Web Analytics」は表示されない（「静的アセットのみのワーカーではメトリックは使用できません」と表示される）。
> 代わりに JS スニペットを `index.html` に直接追加する方法で設定する。

### ステップ 1: Web Analytics でサイトを登録・スニペットを取得

1. [Cloudflare Dashboard → Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics) にアクセス
2. **「Add a site」** をクリック
3. **「Set up hostname」** に `hakoiri-musume.v8jq7w2dm6.workers.dev` と入力
4. 候補が表示されたら選択 → **「Done」**
5. **「Manage site」** → **「JS Snippet」** タブを開き、表示されたコードをコピー

スニペットは以下のような形式:
```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'></script>
```

### ステップ 2: index.html にスニペットを追加

`index.html` の `</body>` 直前にコピーしたスニペットを貼り付けてコミット・プッシュ:

```html
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
    <!-- Cloudflare Web Analytics -->
    <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
      data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
  </body>
```

### ステップ 3: 確認

デプロイ後にページを何度かアクセスし、数分待ってから確認:

1. Cloudflare Dashboard → 左メニュー **「Web Analytics」**
2. サイト一覧から **「hakoiri-musume」** を選択

---

## 計測される指標

| 指標 | 説明 |
|------|------|
| **Visits（訪問数）** | 外部サイト or 直接 URL から来たセッション数 |
| **Page views（PV）** | HTML レスポンス成功数 |
| **Page load time** | ページ読み込み完了までの時間 |
| **Core Web Vitals** | LCP / INP / CLS（Google 推奨のUX指標） |

### 参照できるディメンション（絞り込み・内訳）

- 参照元（Referrer）
- ブラウザ / OS
- デバイス種別（PC / スマホ / タブレット）
- 国・地域
- ページ URL

---

## プライバシーについて

- 訪問者の IP アドレスは保存しない
- Cookie を使用しない
- EU の GDPR に準拠した設計
- 個人を特定しないサマリーデータのみ収集

→ Cookie 同意バナーは不要。

---

## 参考リンク

- [Cloudflare Web Analytics 公式ドキュメント](https://developers.cloudflare.com/analytics/web-analytics/)
- [Pages からの設定手順（公式）](https://developers.cloudflare.com/analytics/web-analytics/getting-started/)
- [計測指標の詳細](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/)
