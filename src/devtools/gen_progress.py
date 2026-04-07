"""タスク進捗一覧を dev-docs/progress.md に自動生成する.

設定ゼロで動作し、全タスクを一覧表示する。
dev-docs/roadmap.yml があればグルーピング表示に切り替わる。

roadmap.yml の書き方は dev-docs/roadmap.yml.example を参照。
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

TASKS_DIR_NAME = "dev-docs/tasks"
DEFAULT_OUTPUT = "dev-docs/progress.md"
ROADMAP_CONFIG = "dev-docs/roadmap.yml"

STATE_ICONS: dict[str, str] = {
    "done": "✅",
    "implemented": "🔧",
    "fixed": "🔧",
    "planned": "🔲",
    "review_failed": "❌",
    "blocked": "⛔",
}


def load_task_statuses(tasks_dir: Path) -> dict[str, dict[str, object]]:
    """全タスクの status.json を読み込んで {task_dir_name: status_dict} を返す."""
    statuses: dict[str, dict[str, object]] = {}
    if not tasks_dir.is_dir():
        return statuses
    for status_file in sorted(tasks_dir.glob("*/status.json")):
        task_dir_name = status_file.parent.name
        try:
            with status_file.open("r", encoding="utf-8") as f:
                statuses[task_dir_name] = json.load(f)
        except (json.JSONDecodeError, OSError):
            statuses[task_dir_name] = {"state": "unknown", "summary": "読み込みエラー"}
    return statuses


def _load_roadmap_config(
    project_root: Path,
) -> tuple[dict[str, dict[str, str]], list[tuple[str, str, list[str]]]]:
    """dev-docs/roadmap.yml からロードマップ設定を読み込む.

    Returns:
        (roadmap_map, groups) のタプル。ファイルがなければ空を返す。
    """
    config_path = project_root / ROADMAP_CONFIG
    if not config_path.exists():
        return {}, []

    try:
        import yaml
    except ImportError:
        return {}, []

    with config_path.open("r", encoding="utf-8") as f:
        data: dict[str, Any] = yaml.safe_load(f) or {}

    roadmap_map: dict[str, dict[str, str]] = {}
    groups: list[tuple[str, str, list[str]]] = []

    # tasks セクション
    for dir_name, info in data.get("tasks", {}).items():
        roadmap_map[str(dir_name)] = {
            "id": str(info.get("id", "")),
            "name": str(info.get("name", dir_name)),
            "actor": str(info.get("actor", "-")),
        }

    # groups セクション
    for g in data.get("groups", []):
        label = str(g.get("label", ""))
        desc = str(g.get("description", ""))
        ids = [str(i) for i in g.get("ids", [])]
        groups.append((label, desc, ids))

    return roadmap_map, groups


def build_progress_markdown(
    statuses: dict[str, dict[str, object]],
    roadmap_map: dict[str, dict[str, str]] | None = None,
    groups: list[tuple[str, str, list[str]]] | None = None,
) -> str:
    """進捗一覧の Markdown 文字列を生成する."""
    if roadmap_map is None:
        roadmap_map = {}
    if groups is None:
        groups = []

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines: list[str] = [
        "# タスク進捗一覧",
        "",
        f"> 自動生成: {now}  ",
        "> `uv run python -m src.devtools.gen_progress` で更新",
        "",
    ]

    # 全体サマリ
    total = len(statuses)
    done_count = sum(1 for s in statuses.values() if str(s.get("state")) == "done")
    lines.append(f"**全体進捗: {done_count}/{total} 完了**")
    lines.append("")

    covered_dirs: set[str] = set()

    if roadmap_map and groups:
        # ロードマップ ID → task_dir_name の逆引き
        id_to_dir: dict[str, str] = {}
        for dir_name, info in roadmap_map.items():
            id_to_dir[info["id"]] = dir_name

        for group_label, group_desc, roadmap_ids in groups:
            lines.append(f"## {group_label}: {group_desc}")
            lines.append("")
            lines.append("| ID | タスク | 担当 | 状態 | タスクディレクトリ |")
            lines.append("|---|---|---|---|---|")

            for rid in roadmap_ids:
                dir_name = id_to_dir.get(rid, "")
                if dir_name and dir_name in statuses:
                    status = statuses[dir_name]
                    state = str(status.get("state", "unknown"))
                    icon = STATE_ICONS.get(state, "❓")
                    info = roadmap_map.get(dir_name, {})
                    name = info.get("name", dir_name)
                    actor = info.get("actor", "-")
                    lines.append(
                        f"| {rid} | {name} | {actor} | {icon} {state} | `{dir_name}` |"
                    )
                    covered_dirs.add(dir_name)
                elif dir_name:
                    info = roadmap_map.get(dir_name, {})
                    name = info.get("name", dir_name)
                    actor = info.get("actor", "-")
                    lines.append(
                        f"| {rid} | {name} | {actor} | ❓ not found | `{dir_name}` |"
                    )
                else:
                    lines.append(f"| {rid} | (未作成) | - | ❓ not found | - |")

            lines.append("")

    # ロードマップ外 or 全タスク一覧
    uncovered = sorted(set(statuses.keys()) - covered_dirs)
    if uncovered:
        section_title = (
            "## その他（ロードマップ外）" if covered_dirs else "## 全タスク一覧"
        )
        lines.append(section_title)
        lines.append("")
        lines.append("| タスクディレクトリ | 概要 | 状態 |")
        lines.append("|---|---|---|")
        for dir_name in uncovered:
            status = statuses[dir_name]
            state = str(status.get("state", "unknown"))
            icon = STATE_ICONS.get(state, "❓")
            summary = str(status.get("summary", ""))
            lines.append(f"| `{dir_name}` | {summary} | {icon} {state} |")
        lines.append("")

    return "\n".join(lines) + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="タスク進捗一覧を生成する")
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"出力ファイル（デフォルト: {DEFAULT_OUTPUT}）",
    )
    parser.add_argument(
        "--stdout-only",
        action="store_true",
        help="stdout のみに出力（ファイル書き出ししない）",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    project_root = Path(__file__).resolve().parents[2]
    tasks_dir = project_root / TASKS_DIR_NAME

    roadmap_map, groups = _load_roadmap_config(project_root)
    statuses = load_task_statuses(tasks_dir)
    markdown = build_progress_markdown(statuses, roadmap_map, groups)

    print(markdown)

    if not args.stdout_only:
        output_path = (project_root / args.output).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(markdown, encoding="utf-8")
        print(f"[OK] {output_path}")


if __name__ == "__main__":
    main()
