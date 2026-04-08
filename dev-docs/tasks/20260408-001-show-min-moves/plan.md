# Plan

## 目的
- puzzles.json の `_minMoves` をゲームプレイ中のヘッダーに常時表示する

## 変更対象ファイル
- `src/game/types.ts` — PuzzleDef に `_minMoves` を追加
- `src/ui/ScreenManager.ts` — ゲームヘッダーに最短手数を表示、getMinMoves のキャスト不要化

## 実装方針
1. `PuzzleDef` に `_minMoves?: number` フィールドを正式追加
2. `ScreenManager.startGame()` のヘッダー info 部分に最短手数表示を追加
3. `getMinMoves()` ヘルパーを型キャスト不要に簡素化

## 検証方法
- [x] typecheck (`tsc --noEmit`)
- [x] unit test (`npm test`)
- [x] ビルド (`npm run build`)

## 前提と解釈
- `_minMoves` がない（undefined）パズルでは最短手数を表示しない
- クリア画面の表示は変更しない（既存動作維持）

## 想定リスク
- 軽微：既存テストで PuzzleDef を手動構築している箇所で型エラーが出る可能性 → `_minMoves` は optional なので影響なし

## ロールバック方針
- types.ts と ScreenManager.ts の2ファイルのみなので revert 容易
