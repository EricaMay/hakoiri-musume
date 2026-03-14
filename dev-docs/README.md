# プロジェクトナビゲーション
プロジェクトの全体概要と現在のステータス

## 目的
Klotski 系スライディングブロックパズルゲーム「箱入り娘」の Web アプリ。

## 作るもの
- Macbook（ブラウザ）と iPhone（モバイルブラウザ）両対応のパズルゲーム
- 4×5 グリッド（可変サイズ対応）上でブロックをスライドし、ターゲットブロックを EXIT まで移動させる

## 現在の状況
- **Phase 1 MVP 実装完了**: 基本的なゲームが動作する状態
- 問題選択 → ゲームプレイ → クリア判定 → 次の問題 の一連のフローが動作
- 5問の初期パズルデータを収録（全問ソルバーで解答可能性を検証済み）
- BFS ソルバーでパズルの最小手数を算出し、難易度を自動設定
- LAN 公開設定済み（`vite.config.ts` の `server.host: true`）

## 技術スタック・アーキテクチャ
- **言語**: TypeScript（Vanilla）
- **描画**: HTML5 Canvas
- **ビルド**: Vite 6
- **パッケージ管理**: npm
- **パズルデータ**: JSON 外部ファイル

## ディレクトリ構成
```
スーパースライド/
├── dev-docs/           # 開発ドキュメント
├── src/
│   ├── main.ts         # エントリポイント
│   ├── style.css       # グローバルスタイル
│   ├── game/
│   │   ├── types.ts    # 型定義
│   │   ├── Board.ts    # 盤面管理・コアロジック
│   │   ├── Solver.ts   # BFS ソルバー（最短解探索）
│   │   └── __tests__/  # ユニットテスト
│   ├── render/
│   │   └── Renderer.ts # Canvas描画
│   ├── input/
│   │   └── InputHandler.ts  # マウス/タッチ入力
│   ├── ui/
│   │   └── ScreenManager.ts # 画面遷移管理
│   └── data/
│       └── puzzles.json # パズルデータ（5問）
├── vite.config.ts      # Vite 設定（LAN公開）
├── index.html
├── package.json
├── tsconfig.json
└── public/
```

## テスト方針
- **テストフレームワーク**: Vitest
- **Board.ts**: 20 テスト（移動、衝突、クリア判定、undo/reset 等）
- **Solver.ts**: 3 テスト（trivial 解、解なし検出、全パズル解答可能性の検証）
- 実行: `npm test`（単発）/ `npm run test:watch`（監視）

## ソルバー
- BFS（幅優先探索）で最短解を探索
- 同サイズブロックは交換可能として状態を圧縮（探索空間の削減）
- 難易度は最小手数から自動設定: beginner ≤30手 / intermediate 31〜60手 / advanced 61〜100手 / expert 101手以上

## デプロイ方針・手順
- **Cloudflare Pages** で GitHub 連携自動デプロイ
- 詳細手順: [dev-docs/deploy.md](deploy.md)
- GitHub リポ: https://github.com/EricaMay/hakoiri-musume

## ロードマップ
- [x] Phase 1: MVP（基本ゲーム動作 + ソルバー検証）
- [ ] Phase 2: UX向上（アニメーション・PWA・ベスト記録・クリア演出）
- [ ] Phase 3: 学習モード（ヒント機能・解法リプレイ・最適手数表示）
- [ ] Phase 4: チャレンジ（星評価・タイマー・統計）
- [ ] Phase 5: コンテンツ拡充（50問以上・章立て・カスタムパズル）

## アンチパターン
- ゲームロジックと描画の密結合を避ける（MVC的分離を維持）