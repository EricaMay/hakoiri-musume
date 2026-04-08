# LLM 伝言板

## 注意事項
- Node.js 20.15.0 のため Vite 8 は使えない。Vite 6 を使うこと。
- tsconfig.json で `erasableSyntaxOnly` が有効。`private` パラメータプロパティは使えない。
- `verbatimModuleSyntax` が有効。型のみのインポートは `import type { ... }` を使う。
- BFS ソルバーの maxStates デフォルトは 500,000。
- パズルデータの `_minMoves` フィールドはメタデータ（ゲームコードでは ScreenManager のクリア画面で参照）。
- ゲーム名称: **箱入り娘**（旧: スーパースライド）
- GitHub: https://github.com/EricaMay/hakoiri-musume
- デプロイ: Cloudflare Pages（GitHub 連携）— 初回設定は dev-docs/deploy.md 参照
- マルチゲーム方針: ゲームごとに別リポ・別サイト

## 実装済み機能
- Phase 1: MVP（ゲームエンジン、Canvas描画、入力、5問のパズル）
- Phase 2: UX改善（スライドアニメーション、localStorage ベスト記録、クリア演出強化、PWA対応）

## 現在のパズル一覧（最小手数）
1. はじめの一歩: 15手 (beginner)
2. 壁をかわせ: 29手 (beginner)
3. 横丁パズル: 27手 (beginner)
4. 交差点: 31手 (intermediate)
5. 道を開けろ: 118手 (expert)

## 次のフェーズ
- Phase 3: ヒント機能（ソルバー活用 + Web Worker）、解法リプレイ、最適手数表示
- Phase 4: 星評価、タイマー、統計ページ
- Phase 5: 50問以上のパズル、章立て、カスタムパズル

## ワークスペースレビュー所見（2026-03-14）
- `dev-docs/README.md` のロードマップ表記が実装状況とズレている。冒頭では Phase 2 完了となっている一方、ロードマップでは Phase 2 が未完了 `[ ]` のまま。
- 現状 `npm test` は失敗する。`src/game/__tests__/Solver.test.ts` の「全パズルデータの解答可能性を検証」が 5000ms タイムアウトする一方、`npm run build` は成功。
- `src/data/ProgressStore.ts` は `localStorage` の読込/保存失敗を握りつぶす実装。ストレージ破損や容量超過時に進捗未保存へ気づきにくい。
- 名前まわりに旧名称が残っている。パッケージ名/GitHub は `hakoiri-musume`、ゲーム名は「箱入り娘」だが、ローカルのディレクトリ名は `スーパースライド` のまま。
