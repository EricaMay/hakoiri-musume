# Worklog

## 2026-04-09 08:55 planner
- `src/game/types.ts`: `PuzzleDef` に `_minMoves?: number` を正式追加
- `src/ui/ScreenManager.ts`: ゲームヘッダーに最短手数表示を追加、`getMinMoves()` の型キャスト除去
- `src/style.css`: `.min-moves` スタイル追加
- 実行: `npx tsc --noEmit` → 成功
- 実行: `npm test` → 27テスト全パス
- 実行: `npm run build` → 成功
