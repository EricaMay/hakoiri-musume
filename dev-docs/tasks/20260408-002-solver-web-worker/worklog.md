# Worklog

## 2026-04-09 08:55 planner
- `src/game/solver.worker.ts`: 新規作成 — Worker 本体（メッセージ受信 → Solver 実行 → 結果返却）
- `src/game/SolverClient.ts`: 新規作成 — Promise ベースのクライアント（solve / solveFromState / dispose）
- 実行: `npx tsc --noEmit` → 成功
- 実行: `npm test` → 27テスト全パス
- 実行: `npm run build` → 成功
- 備考: Worker のユニットテストは Vitest 環境で Web Worker が動作しないため追加せず。既存 Solver テストでロジックは網羅
