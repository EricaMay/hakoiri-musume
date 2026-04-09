# Worklog

## 実装完了

### 変更ファイル
- `src/render/Renderer.ts`: ヒントハイライト描画（パルスする金色ボーダー + 方向矢印）
- `src/ui/ScreenManager.ts`: 💡ボタン追加、`onHintClick()` で SolverClient 経由で次の最適手を算出、ハイライト設定
- `src/style.css`: `.header-btn:disabled` スタイル追加

### 動作仕様
- 💡ボタンクリック → Web Worker で現在盤面からBFS実行 → 最適な次の一手をハイライト表示
- ユーザーが手を動かすとヒントハイライトは自動クリア
- 計算中はボタンが ⏳ に変わり disabled
- 解なしの場合は「解なし」表示（2秒後に復帰）
- ヒント使用回数はクリア画面に表示
