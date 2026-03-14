# LLM 伝言板

## 注意事項
- Node.js 20.15.0 のため Vite 8 は使えない。Vite 6 を使うこと。
- tsconfig.json で `erasableSyntaxOnly` が有効。`private` パラメータプロパティ（`constructor(private x: T)`）は使えない。通常のプロパティ宣言 + コンストラクタ代入を使う。
- `verbatimModuleSyntax` が有効。型のみのインポートは `import type { ... }` を使う。
- BFS ソルバーの maxStates デフォルトは 500,000。道を開けろ（118手）の探索に約5秒かかる。
- パズルデータの `_minMoves` フィールドはメタデータ（ゲームコードでは参照しない）。
- ゲーム名称: **箱入り娘**（旧: スーパースライド）
- GitHub: https://github.com/EricaMay/hakoiri-musume
- デプロイ: Cloudflare Pages（GitHub 連携）— 初回設定は dev-docs/deploy.md 参照

## 現在のパズル一覧（最小手数）
1. はじめの一歩: 15手 (beginner)
2. 壁をかわせ: 29手 (beginner)
3. 横丁パズル: 27手 (beginner)
4. 交差点: 31手 (intermediate)
5. 道を開けろ: 118手 (expert)

## ロードマップ
- Phase 1: MVP ✅
- Phase 2: UX向上（アニメーション・PWA・ベスト記録・クリア演出）
- Phase 3: 学習モード（ヒント・解法リプレイ）
- Phase 4: チャレンジ（星評価・タイマー・統計）
- Phase 5: コンテンツ拡充（50問以上）
