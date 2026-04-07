# 開発全容と運用ルール
プロジェクト概要、運用ルールはこのファイルを起点に全体を把握できるようにする。

## プロジェクト概要

### 目的
Klotski 系スライディングブロックパズルゲーム「箱入り娘」の Web アプリ。

### 作るもの
- Macbook（ブラウザ）と iPhone（モバイルブラウザ）両対応のパズルゲーム
- 4×5 グリッド（可変サイズ対応）上でブロックをスライドし、ターゲットブロックを EXIT まで移動させる

### 現在の状況
- **Phase 1 MVP + Phase 2 UX 実装完了**
- 問題選択 → ゲームプレイ → クリア判定 → 次の問題 の一連のフローが動作
- 5問の初期パズルデータを収録（全問ソルバーで解答可能性を検証済み）
- BFS ソルバーでパズルの最小手数を算出し、難易度を自動設定
- ブロック移動アニメーション（ease-out 120ms）
- ベスト記録保存（localStorage）、クリア画面に最適手数比較 + 星評価
- PWA 対応（オフラインプレイ、iPhone ホーム画面追加可能）

### 技術スタック・アーキテクチャ
- **言語**: TypeScript（Vanilla）
- **描画**: HTML5 Canvas
- **ビルド**: Vite 6
- **パッケージ管理**: npm
- **パズルデータ**: JSON 外部ファイル

### ディレクトリ構成
```
hakoiri-musume/
├── .github/
│   ├── copilot-instructions.md
│   ├── agents/          # Copilot agent 定義
│   └── prompts/         # Copilot prompt 定義
├── dev-docs/            # 開発ドキュメント
│   ├── README.md        # このファイル（全容と運用ルール）
│   ├── fb-to-llm.md     # 人間からのフィードバック
│   ├── llm-msg-bd.md    # LLM 伝言板
│   ├── summary.md       # タスク完了サマリ
│   ├── tasks/           # タスクディレクトリ
│   └── templates/       # タスクテンプレート
├── src/
│   ├── main.ts          # エントリポイント
│   ├── style.css        # グローバルスタイル
│   ├── game/
│   │   ├── types.ts     # 型定義
│   │   ├── Board.ts     # 盤面管理・コアロジック
│   │   ├── Solver.ts    # BFS ソルバー（最短解探索）
│   │   └── __tests__/   # ユニットテスト
│   ├── render/
│   │   └── Renderer.ts  # Canvas描画
│   ├── input/
│   │   └── InputHandler.ts  # マウス/タッチ入力
│   ├── ui/
│   │   └── ScreenManager.ts # 画面遷移管理
│   ├── data/
│   │   └── puzzles.json # パズルデータ（5問）
│   └── devtools/        # Python 開発ツール
│       ├── gen_progress.py       # タスク進捗一覧生成
│       └── gen_review_targets.py # レビュー対象一覧
├── vite.config.ts
├── index.html
├── package.json
├── pyproject.toml       # Python devtools 用
├── tsconfig.json
└── public/
```

### テスト方針
- **テストフレームワーク**: Vitest
- **Board.ts**: 20 テスト（移動、衝突、クリア判定、undo/reset 等）
- **Solver.ts**: 3 テスト（trivial 解、解なし検出、全パズル解答可能性の検証）
- 実行: `npm test`（単発）/ `npm run test:watch`（監視）

### ソルバー
- BFS（幅優先探索）で最短解を探索
- 同サイズブロックは交換可能として状態を圧縮（探索空間の削減）
- 難易度は最小手数から自動設定: beginner ≤30手 / intermediate 31〜60手 / advanced 61〜100手 / expert 101手以上

### デプロイ方針・手順
- **Cloudflare Pages** で GitHub 連携自動デプロイ
- 詳細手順: [dev-docs/deploy.md](deploy.md)
- GitHub リポ: https://github.com/EricaMay/hakoiri-musume

### ロードマップ
- [x] Phase 1: MVP（基本ゲーム動作 + ソルバー検証）
- [x] Phase 2: UX向上（アニメーション・PWA・ベスト記録・クリア演出）
- [ ] Phase 3: 学習モード（ヒント機能・解法リプレイ・最適手数表示）
- [ ] Phase 4: チャレンジ（星評価・タイマー・統計）
- [ ] Phase 5: コンテンツ拡充（50問以上・章立て・カスタムパズル）

### アンチパターン
- ゲームロジックと描画の密結合を避ける（MVC的分離を維持）

### マルチゲーム方針
- ゲームごとに独立したリポジトリ・Cloudflare Pages プロジェクトとする
- 共通ライブラリは作らず、必要に応じてコピー or npm パッケージ化

---

## 運用ルール

### 運用フロー

#### 基本の運用フロー
1. 人間が新規タスクディレクトリを作成し、`task.md` を書く（タスク種別問わず）
2. planner が `plan.md` を更新して実装する
3. reviewer がレビューする
4. 必須修正があれば planner が修正する
5. 必要に応じて tester / maintainer が補完する

#### テストのみ追加・改善
- task の範囲が明確なら tester から始めてよい
- 範囲が曖昧なら planner で計画してから tester

#### ドキュメント整理・README更新のみ
- maintainer から始めてよい

### タスクディレクトリ
- 新しい依頼ごとに`dev-docs/tasks/<task_id>/` を作成
    - `dev-docs/templates/YYYYMMDD-001-title/` を複製
    - 以下を必ず置換
      - ディレクトリ名: `YYYYMMDD-001-title` -> 日付 + 連番 + 短い名前 `2026-03-25-001-search-ui` など
      - `status.json`
        - `task_id`: ディレクトリ名と同じ
        - `summary`: タスクの短い要約
        - `last_updated_at`: 現在時刻のISO 8601形式
          - Macターミナルなら`date -u +"%Y-%m-%dT%H:%M:%SZ"` などで取得可能
      - `task.md` の背景・目的・完了条件
- 各 prompt、agentは、対象タスクディレクトリを最初に確認する
- 個別タスクの状態は各 `status.json` に持たせる
- タスク完了後は消さずに残し、`dev-docs/summary.md`に短く要約する

### ファイル構成
- `dev-docs/tasks/<task_id>/`
  - `task.md`: 人間からの依頼内容
    - 人間からの依頼、背景、完了条件、制約、フィードバックを記載する
  - `plan.md`: 実装計画
    - 実装担当モデルが実装計画を記載する
    - 目的、変更対象、実装方針、検証方法、前提、リスクを含める
  - `review.md`: レビュー結果
    - レビュー担当モデルがレビュー結果を記載する
    - Verdict, Findings, Required fixes, Optional suggestions を含める
  - `worklog.md`: 実装・検証ログ
    - 実装担当モデルが何を変更し、何を実行して確認したかを簡潔に記録する
  - `decisions.md`: 設計判断の記録
    - 設計判断や採用しなかった案、その理由を記録する
  - `status.json`: 進捗状態
- `dev-docs/summary.md`
  - タスク全体のサマリだけを簡潔に記録する
  - 人間が一覧で振り返る用途
  - 詳細は各 task ディレクトリを参照する
- `dev-docs/templates/`
  - タスクやレビューのテンプレートファイルを置くディレクトリ

### 個別ファイルのフォーマットや記載例
#### worklog.md
- タイトル: `## YYYY-MM-DD HH:mm [actor]`
- 内容: 何を変更し、何を実行して確認したかを簡潔に記録する

```md
## 2026-03-25 10:30 planner
- `src/...` を更新
- `tests/...` を追加
- 実行: `npm run lint`
- 実行: `npm run test`
- 結果: すべて成功

## 2026-03-25 10:45 planner
- `review.md` の Required fixes を反映
- 実行: `npm run typecheck`
- 結果: 成功
```

#### decisions.md
- タイトル: `## YYYY-MM-DD: タイトル`
- 内容: 設計判断や採用しなかった案、その理由を記録


```md
## 2026-03-25: APIエラー時は toast ではなく inline message を採用
- 背景: エラー発生時に入力中コンテキストを保ちたかった
- 採用案: フォーム直下にメッセージ表示
- 不採用案: モーダル、toast
- 理由: 操作継続性が高く、実装も単純なため
```

#### status.json
##### フィールド説明
- `task_id`: タスク識別子
- `summary`: タスクの短い要約
- `state`: 現在状態
  - `planned`: 人間が `task.md` を記載し、実装待ちの状態（空ファイルも同義）
  - `implemented`: 実装担当モデルが初回実装を完了した状態
  - `review_failed`: レビュー担当モデルが必須修正ありと判断した状態
  - `fixed`: 実装担当モデルがレビュー指摘への対応を完了した状態
  - `done`: レビュー担当モデルが問題なしと判断した状態
- `next_actor`: 次に動く役割。例: `planner`, `reviewer`, `maintainer`, `human`
- `review_round`: レビュー修正ループ回数
- `last_updated_by`: 最後に更新した主体
- `last_updated_at`: ISO 8601形式の時刻
- `must_pass`: 必須検証項目、プロジェクト特性に応じて変更してよい
- `notes`: 補足

##### status.json 更新責務
- human:
  - 新規 task 作成時に `planned` で初期化
  - `next_actor` を `planner` に設定
- planner:
  - 初回実装完了時に `implemented` へ更新
  - 修正対応完了時に `fixed` へ更新
  - `next_actor` を `reviewer` に設定
- reviewer:
  - 必須修正ありなら `review_failed` へ更新、next_actor を `planner` に設定
  - 問題なしなら `done` へ更新、next_actor を `human` に設定
- maintainer / tester:
  - 原則 `state`, `next_actor` は変更しない

```json
{
  "task_id": "2026-03-25-001",
  "summary": "トップページの検索UI改善",
  "state": "planned",
  "next_actor": "planner",
  "review_round": 0,
  "last_updated_by": "human",
  "last_updated_at": "2026-03-25T10:00:00+09:00",
  "must_pass": ["lint", "typecheck", "unit-test"],
  "notes": ""
}
```

#### summary.md
- タイトル: `## YYYY-MM-DD-XXX-タイトル`
- 内容: 個別タスクごとに全体のサマリだけを簡潔に記録
- reviewer が `done` 判定時に追記する
```md
## 2026-03-25-001-search-ui
- 状態: done ✅
- 概要: 検索UIの見直し、結果カード余白調整、ローディング表示追加
- 補足: デザインレビューで余白ルールを修正

## 2026-03-26-002-title-screen
- 状態: review_failed ⚠️
- 概要: タイトル画面の背景アニメーション追加
- 補足: 補間設定と文字コントラストに修正指摘あり
```

### 開発ツール

#### タスク進捗一覧の生成
```bash
uv run python -m src.devtools.gen_progress          # progress.md に出力
uv run python -m src.devtools.gen_progress --stdout-only  # 標準出力のみ
```

#### レビュー対象タスクの一覧
```bash
uv run python -m src.devtools.gen_review_targets     # テキスト出力
uv run python -m src.devtools.gen_review_targets --json  # JSON 出力
```