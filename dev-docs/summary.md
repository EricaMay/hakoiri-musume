# Task Summary

## 20260408-001-show-min-moves
- 状態: done ✅
- 概要: `PuzzleDef` に `_minMoves` を追加し、ゲームヘッダーに「最短: XX手」を表示。`_minMoves` 未設定時は表示しない実装に統一。
- 補足: `getMinMoves()` の型キャストを削除し、型定義と利用箇所を整合。

## 20260408-002-solver-web-worker
- 状態: done ✅
- 概要: `solver.worker.ts` と `SolverClient.ts` を追加し、Solver を Web Worker で Promise ベース実行できる基盤を実装。
- 補足: `solveFromState()` により任意盤面（Block[]）からの求解に対応し、`Solver.ts` の既存インターフェースは維持。

## 20260408-003-hint-feature
- 状態: done ✅
- 概要: ゲーム画面に `💡` ヒントボタンを追加し、Web Worker 経由で現在盤面の最適次手を算出して Canvas 上でハイライト表示。
- 補足: 計算中表示・解なし時の復帰表示・ヒント使用回数の表示を実装。
