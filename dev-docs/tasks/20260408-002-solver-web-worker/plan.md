# Plan

## 目的
- Solver を Web Worker で非同期実行し、ヒント・リプレイ機能の基盤とする

## 変更対象ファイル
- `src/game/solver.worker.ts` — 新規: Worker 本体
- `src/game/SolverClient.ts` — 新規: Promise ベースのクライアント

## 実装方針
1. `solver.worker.ts`: メッセージ受信 → PuzzleDef から Solver を生成 → solve() 実行 → 結果を返す
2. `SolverClient.ts`: Worker 生成、Promise ラッパー、リクエスト ID 管理
3. 任意の盤面状態（Block[]）からの求解: Board の現在状態から PuzzleDef を合成して Worker に渡す
4. 既存の Solver.ts は変更しない

## 検証方法
- [x] typecheck (`tsc --noEmit`)
- [x] unit test (`npm test`)
- [x] ビルド (`npm run build`)

## 前提と解釈
- Vite 6 は `new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' })` をサポート
- Worker 内で import が使えるのは build 時に Vite がバンドルするため
- 同時に複数リクエストを送る可能性があるため、リクエスト ID で管理する

## 想定リスク
- Worker の初回ロードに若干の遅延（初回ヒント表示時に体感される可能性）
- Vitest 環境では Web Worker が動かないため、SolverClient のユニットテストは追加しない（既存 Solver テストで網羅）

## ロールバック方針
- 新規ファイル2つの削除のみ。既存コードへの変更なし
