import { describe, it, expect } from 'vitest';
import { Solver } from '../Solver';
import type { PuzzleDef } from '../types';
import puzzlesData from '../../data/puzzles.json';

/** 最小テスト: 1手で解けるパズル */
const trivialPuzzle: PuzzleDef = {
  id: 'trivial',
  name: 'Trivial',
  difficulty: 'beginner',
  board: { width: 2, height: 3 },
  exit: { x: 0, y: 3, width: 2, height: 1 },
  blocks: [
    { id: 'target', type: '2x2', x: 0, y: 0, isTarget: true },
    // 4マス使用 / 6マス中 → 2マス空き (0,2), (1,2)
    // target を下に1マスで (0,1) → target.y+h = 3 = height → clear
  ],
};

/** 解けないパズル（ターゲットが壁に閉じ込められている）*/
const unsolvablePuzzle: PuzzleDef = {
  id: 'unsolvable',
  name: 'Unsolvable',
  difficulty: 'beginner',
  board: { width: 4, height: 3 },
  exit: { x: 1, y: 3, width: 2, height: 1 },
  blocks: [
    { id: 'target', type: '2x2', x: 0, y: 0, isTarget: true },
    { id: 'wall1', type: '2x1', x: 2, y: 0 },
    { id: 'wall2', type: '2x1', x: 0, y: 2 },
    { id: 'wall3', type: '2x1', x: 2, y: 2 },
    // row 0: TT WW, row 1: TT .., row 2: WW WW
    // target at (0,0), needs to reach (1,1) for clear (x=1, y+2=3)
    // but target can only move right by 0 (wall at 2,0) or down by 0 (wall at 0,2 blocks at row 2)
    // wait, actually target can move down 0... let me recalculate
    // row 0: (0,0)(1,0) target, (2,0)(3,0) wall1
    // row 1: (0,1)(1,1) target, (2,1)(3,1) empty
    // row 2: (0,2)(1,2) wall2, (2,2)(3,2) wall3
    // target can move right to x=2? no, wall1 at (2,0)-(3,0) blocks it
    // empty spaces at (2,1) and (3,1)
    // target needs x=1, y=1 for clear. target is already at x=0, y=0.
    // target can't go right (wall1), can't go down (wall2 at y=2 means ny+h=0+1+2=2+2=4>3... wait
    // target at (0,0), h=2, move down: ny=1, ny+h=3=height. But (0,2) and (1,2) are wall2.
    // canMove: ny=1, target covers (0,1)(1,1)(0,2)(1,2). wall2 at (0,2)(1,2). Collision! Can't move down.
    // So target stuck at (0,0) forever. Unsolvable since exit needs x=1.
  ],
};

describe('Solver', () => {
  it('1手で解けるパズルを正しく解く', () => {
    const solver = new Solver(trivialPuzzle);
    const result = solver.solve();
    expect(result.solvable).toBe(true);
    expect(result.minMoves).toBe(1);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toEqual({ blockId: 'target', direction: 'down' });
  });

  it('解けないパズルを検出する', () => {
    const solver = new Solver(unsolvablePuzzle);
    const result = solver.solve();
    expect(result.solvable).toBe(false);
  });

  it('全パズルデータの解答可能性を検証', () => {
    const puzzles = puzzlesData as PuzzleDef[];
    for (const p of puzzles) {
      const solver = new Solver(p);
      const result = solver.solve();
      console.log(`${p.name}: solvable=${result.solvable}, minMoves=${result.minMoves}`);
      expect(result.solvable, `${p.name} は解けるべき`).toBe(true);
    }
  });
});
