---
description: "implemented/fixed 状態のタスクを一括レビューする"
model: GPT-5.3-Codex (copilot)
tools: [execute, read, edit, search, web, todo]
---

## 指示

1. `dev-docs/` 配下のタスクディレクトリを走査し、`status.json` の `state` が `implemented` または `fixed` のタスクを特定してください
2. 該当タスクがなければ「レビュー対象なし」と報告して終了
3. 該当タスクがあれば、各タスクディレクトリの以下を読み込んでください:
   - `task.md` — 要件
   - `plan.md` — 実装計画
   - `status.json` — 現在状態
   - `worklog.md` — 実装ログ
4. `.github/agents/reviewer.agent.md` のレビュー手順・観点に従ってレビューを実施
5. 各タスクの `review.md` にレビュー結果を記載
6. `status.json` を更新（PASS → `done`, FAIL → `review_failed`）
7. `done` にした場合は `dev-docs/summary.md` に追記

複数タスクがある場合は **並列でレビュー** してください。
共通ルールは `dev-docs/README.md` を参照。
