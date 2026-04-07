"""レビュー対象タスクの一覧を表示する CLI ツール.

Usage:
    uv run python -m src.devtools.gen_review_targets
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

TASKS_DIR_NAME = "dev-docs/tasks"

# アクション別の表示設定
_ACTION_MAP: dict[str, tuple[str, str]] = {
    "implemented": ("📋 レビュー待ち", "reviewer"),
    "fixed": ("📋 レビュー待ち（修正済み）", "reviewer"),
    "review_failed": ("🔧 修正待ち", "planner"),
}


def scan_tasks(tasks_dir: Path) -> dict[str, list[tuple[str, str]]]:
    """タスクディレクトリを走査し、アクションが必要なタスクを分類する.

    Returns:
        {state: [(dir_name, summary), ...]} の辞書
    """
    result: dict[str, list[tuple[str, str]]] = {
        "implemented": [],
        "fixed": [],
        "review_failed": [],
    }
    if not tasks_dir.is_dir():
        return result

    for status_file in sorted(tasks_dir.glob("*/status.json")):
        try:
            with status_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue

        state = str(data.get("state", ""))
        if state in result:
            dir_name = status_file.parent.name
            summary = str(data.get("summary", ""))
            result[state].append((dir_name, summary))

    return result


def format_output(
    targets: dict[str, list[tuple[str, str]]],
    tasks_dir_name: str = TASKS_DIR_NAME,
) -> str:
    """人間が読める形式でフォーマットする."""
    lines: list[str] = []

    # レビュー待ち
    review_targets = targets["implemented"] + targets["fixed"]
    lines.append(f"📋 レビュー待ち (implemented/fixed): {len(review_targets)}件")
    for dir_name, summary in review_targets:
        state = "fixed" if (dir_name, summary) in targets["fixed"] else "implemented"
        lines.append(f"  - {dir_name} ({state}) {summary}")

    lines.append("")

    # 修正待ち
    fix_targets = targets["review_failed"]
    lines.append(f"🔧 修正待ち (review_failed): {len(fix_targets)}件")
    for dir_name, summary in fix_targets:
        lines.append(f"  - {dir_name} (review_failed) {summary}")

    # コピペ用テキスト
    if review_targets:
        lines.append("")
        lines.append("📝 レビュー指示（コピー用）:")
        refs = " ".join(f"@{tasks_dir_name}/{d}/" for d, _ in review_targets)
        lines.append(f"Fleet deployed: {refs} を並列レビューしてください。")

    if fix_targets:
        lines.append("")
        lines.append("📝 修正指示（コピー用）:")
        refs = " ".join(f"@{tasks_dir_name}/{d}/" for d, _ in fix_targets)
        lines.append(f"Fleet deployed: {refs} の review.md を確認して修正してください。")

    if not review_targets and not fix_targets:
        lines.append("")
        lines.append("✅ アクション不要 — すべてのタスクが done または planned です。")

    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="レビュー対象タスクの一覧を表示する")
    parser.add_argument(
        "--json",
        action="store_true",
        help="JSON形式で出力",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    project_root = Path(__file__).resolve().parents[2]
    tasks_dir = project_root / TASKS_DIR_NAME

    targets = scan_tasks(tasks_dir)

    if args.json:
        output: dict[str, list[dict[str, str]]] = {}
        for state, items in targets.items():
            output[state] = [{"dir": d, "summary": s} for d, s in items]
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(format_output(targets))


if __name__ == "__main__":
    main()
