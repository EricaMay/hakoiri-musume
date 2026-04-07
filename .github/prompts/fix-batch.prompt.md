---
description: "review_failed 状態のタスクを一括修正する"
model: Claude Opus 4.6 (copilot)
tools: [vscode, execute, read, edit, search, web, todo]
---

## 指示

1. `dev-docs/` 配下のタスクディレクトリを走査し、`status.json` の `state` が `review_failed` のタスクを特定してください
2. 該当タスクがなければ「修正対象なし」と報告して終了
3. 該当タスクがあれば、各タスクディレクトリの以下を読み込んでください:
   - `review.md` — Required fixes を確認（最優先）
   - `task.md` — 要件
   - `plan.md` — 実装計画
   - `status.json` — 現在状態
4. `.github/agents/planner.agent.md` の修正手順に従って対応:
   - `review.md` の Required fixes をすべて反映
   - 必須検証（lint / typecheck / test）を実行
   - `worklog.md` に修正内容を追記
   - `status.json` を `fixed` に更新（`review_round` は維持）

複数タスクがある場合は **並列で修正** してください。
共通ルールは `dev-docs/README.md` を参照。
