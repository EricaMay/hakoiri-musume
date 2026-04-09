# Plan

## 目的
- ゲーム画面に「▶ 解法」ボタンを追加し、最適解をステップバイステップでアニメーション再生する

## 変更対象ファイル
- `src/ui/ReplayController.ts` — 新規: リプレイ状態管理クラス
- `src/ui/ScreenManager.ts` — 解法ボタン追加、リプレイ制御UI、ReplayController 連携
- `src/style.css` — リプレイコントロールのスタイル

## 実装方針
1. ReplayController クラスを新規作成（開始/一時停止/再開/停止/速度変更）
2. ScreenManager に解法ボタンを追加
3. ボタン押下で盤面リセット → SolverClient.solve() → ReplayController.start()
4. 各ステップで Board.moveBlock + Renderer.startAnimation をチェーン実行
5. リプレイ中は入力を無効化（InputHandler.enabled = false）
6. コントロールUI切り替え: 通常操作 ↔ リプレイ操作（⏸/▶, ⏹, 速度）
7. リプレイ完了/停止で通常UIに復帰

## 検証方法
- [x] typecheck
- [x] unit test
- [x] ビルド

## 前提と解釈
- 初期盤面からの再生のみ（途中盤面からは非対応）
- リプレイ中の手数表示は「再生: X/Y 手」形式
- リプレイ完了後はクリア画面を表示しない（デモンストレーション扱い）
- 停止した場合はその時点の盤面で通常操作に復帰
- 速度: 遅い(500ms) / 普通(250ms) / 速い(100ms)

## 想定リスク
- アニメーション中に stop() を呼んだ場合の状態管理 → stopped フラグで次ステップをキャンセル
