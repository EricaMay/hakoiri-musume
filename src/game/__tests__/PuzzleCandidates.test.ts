import { describe, it, expect } from 'vitest';
import { Solver } from '../Solver';
import type { PuzzleDef } from '../types';

/**
 * 候補パズルの検証用テスト。
 * 古典的な Klotski 配置をベースに検証する。
 */

const base = {
  difficulty: 'beginner' as const,
  board: { width: 4, height: 5 },
  exit: { x: 1, y: 5, width: 2, height: 1 },
};

// 横刀立馬（有名な Klotski 配置）
// A ★ ★ B     row 0
// A ★ ★ B     row 1
// C D D E     row 2
// C f g E     row 3
// h . . i     row 4
const yokotou: PuzzleDef = {
  ...base, id: 'yokotou', name: '横刀立馬',
  blocks: [
    { id: 'target', type: '2x2', x: 1, y: 0, isTarget: true },
    { id: 'a', type: '1x2', x: 0, y: 0 },
    { id: 'b', type: '1x2', x: 3, y: 0 },
    { id: 'c', type: '1x2', x: 0, y: 2 },
    { id: 'd', type: '2x1', x: 1, y: 2 },
    { id: 'e', type: '1x2', x: 3, y: 2 },
    { id: 'f', type: '1x1', x: 1, y: 3 },
    { id: 'g', type: '1x1', x: 2, y: 3 },
    { id: 'h', type: '1x1', x: 0, y: 4 },
    { id: 'i', type: '1x1', x: 3, y: 4 },
  ],
};

// シンプル初級: 4列空き
// ★ ★ A A     row 0
// ★ ★ A A     row 1
// B B C C     row 2
// d e f g     row 3
// . . . .     row 4
const simple4empty: PuzzleDef = {
  ...base, id: 'simple4', name: 'シンプル初級',
  blocks: [
    { id: 'target', type: '2x2', x: 0, y: 0, isTarget: true },
    { id: 'a', type: '1x2', x: 2, y: 0 },
    { id: 'aa', type: '1x2', x: 3, y: 0 },
    { id: 'b', type: '2x1', x: 0, y: 2 },
    { id: 'c', type: '2x1', x: 2, y: 2 },
    { id: 'd', type: '1x1', x: 0, y: 3 },
    { id: 'e', type: '1x1', x: 1, y: 3 },
    { id: 'f', type: '1x1', x: 2, y: 3 },
    { id: 'g', type: '1x1', x: 3, y: 3 },
  ],
};

// 近衛兵（別の有名配置）
// A ★ ★ B     row 0
// A ★ ★ B     row 1
// C D D E     row 2
// C . . E     row 3
// f       g     row 4
// empty: (1,3)(2,3) or (1,4)(2,4)... let me adjust
// f . . g     row 4
const konoe: PuzzleDef = {
  ...base, id: 'konoe', name: '近衛兵',
  blocks: [
    { id: 'target', type: '2x2', x: 1, y: 0, isTarget: true },
    { id: 'a', type: '1x2', x: 0, y: 0 },
    { id: 'b', type: '1x2', x: 3, y: 0 },
    { id: 'c', type: '1x2', x: 0, y: 2 },
    { id: 'd', type: '2x1', x: 1, y: 2 },
    { id: 'e', type: '1x2', x: 3, y: 2 },
    { id: 'f', type: '1x1', x: 0, y: 4 },
    { id: 'g', type: '1x1', x: 3, y: 4 },
    // empty: (1,3)(2,3)(1,4)(2,4) — 4 empty cells
  ],
};

// 小橋: ブロック少なめの簡単配置
// ★ ★ . .     row 0
// ★ ★ . .     row 1
// A A B B     row 2
// c d e f     row 3
// . . . .     row 4
const kobashi: PuzzleDef = {
  ...base, id: 'kobashi', name: '小橋',
  blocks: [
    { id: 'target', type: '2x2', x: 0, y: 0, isTarget: true },
    { id: 'a', type: '2x1', x: 0, y: 2 },
    { id: 'b', type: '2x1', x: 2, y: 2 },
    { id: 'c', type: '1x1', x: 0, y: 3 },
    { id: 'd', type: '1x1', x: 1, y: 3 },
    { id: 'e', type: '1x1', x: 2, y: 3 },
    { id: 'f', type: '1x1', x: 3, y: 3 },
  ],
};

describe('パズル候補検証', () => {
  const candidates: [string, PuzzleDef][] = [
    ['横刀立馬', yokotou],
    ['シンプル初級', simple4empty],
    ['近衛兵', konoe],
    ['小橋', kobashi],
  ];

  for (const [name, puzzle] of candidates) {
    it(`${name} が解けること`, () => {
      const solver = new Solver(puzzle);
      const result = solver.solve();
      console.log(`  ${name}: solvable=${result.solvable}, minMoves=${result.minMoves}`);
      expect(result.solvable).toBe(true);
    });
  }
});
