# Plan

## 目的
- ゲーム画面に「💡 ヒント」ボタンを追加し、Web Worker 経由で次の最適手をハイライト表示する

## 変更対象ファイル
- `src/render/Renderer.ts` — ヒントハイライト描画（金色ボーダー + 方向矢印）
- `src/ui/ScreenManager.ts` — ヒントボタン追加、SolverClient 連携、ヒント回数カウント
- `src/input/InputHandler.ts` — `enabled` フラグ追加（リプレイ時の入力無効化用、Task 004 と共用）
- `src/style.css` — ボタン disabled スタイル

## 実装方針
1. Renderer にヒントハイライト機能を追加（`setHintHighlight` / `clearHintHighlight`）
2. 金色のパルスボーダー + 方向矢印をブロック上に描画
3. ScreenManager にヒントボタンを追加、SolverClient を遅延初期化
4. ボタン押下で `solveFromState()` → 最初の1手をハイライト
5. 計算中はボタンを「計算中...」に変更し disabled
6. ユーザーが手を動かしたらヒントをクリア
7. ヒント使用回数をクリア画面に表示

## 検証方法
- [x] typecheck
- [x] unit test
- [x] ビルド

## 前提と解釈
- ヒントは現在の盤面から1手先のみ表示
- ソルバーが解を見つけられない場合（maxStates 超過）はエラーメッセージを一時表示
- ヒント使用にペナルティなし（Phase 4 で検討）

## 想定リスク
- 難しいパズル（道を開けろ: 118手）は途中盤面からの求解に時間がかかる可能性 → Worker で非同期なので UI は止まらない
