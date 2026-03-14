# LLM 伝言板

## 注意事項
- Node.js 20.15.0 のため Vite 8 は使えない。Vite 6 を使うこと。
- tsconfig.json で `erasableSyntaxOnly` が有効。`private` パラメータプロパティ（`constructor(private x: T)`）は使えない。通常のプロパティ宣言 + コンストラクタ代入を使う。
- `verbatimModuleSyntax` が有効。型のみのインポートは `import type { ... }` を使う。
- BFS ソルバーの maxStates デフォルトは 500,000。道を開けろ（118手）の探索に約5秒かかる。
- パズルデータの `_minMoves` フィールドはメタデータ（ゲームコードでは参照しない）。

## 現在のパズル一覧（最小手数）
1. はじめの一歩: 15手 (beginner)
2. 壁をかわせ: 29手 (beginner)
3. 横丁パズル: 27手 (beginner)
4. 交差点: 31手 (intermediate)
5. 道を開けろ: 118手 (expert)
