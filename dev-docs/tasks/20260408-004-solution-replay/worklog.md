# Worklog

## 実装完了

### 変更ファイル
- `src/ui/ReplayController.ts`: 新規。リプレイ状態管理（start/pause/resume/stop/cycleSpeed）
- `src/input/InputHandler.ts`: `enabled` フラグ追加（リプレイ中は入力無効化）
- `src/ui/ScreenManager.ts`: ▶解法ボタン追加、リプレイ制御UI（⏸/⏹/速度切替）、`onReplayClick()` 実装
- `src/style.css`: `.controls-group` レイアウト追加

### 動作仕様
- ▶解法ボタンクリック → 盤面リセット → Web Worker で最適解を算出 → ステップごとにアニメーション再生
- リプレイ中は操作ボタンが ⏸一時停止/⏹停止/速度切替 に切り替わる
- 速度3段階: 🐢遅い(500ms) / 普通(250ms) / 🐇速い(100ms)
- リプレイ中はユーザー入力無効
- 停止すると現在ステップの盤面で操作復帰（通常コントロールに戻る）
- リプレイ完了後もクリア画面は表示しない（デモモード）
