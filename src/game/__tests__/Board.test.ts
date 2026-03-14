import { describe, it, expect } from 'vitest';
import { Board } from '../Board';
import type { PuzzleDef } from '../types';

/** 最小テスト用パズル: 3×3盤面、ターゲット2×2 + 空き5マス */
const simplePuzzle: PuzzleDef = {
  id: 'test_simple',
  name: 'Simple',
  difficulty: 'beginner',
  board: { width: 3, height: 3 },
  exit: { x: 0, y: 3, width: 2, height: 1 },
  blocks: [
    { id: 'target', type: '2x2', x: 0, y: 0, isTarget: true },
    // 2×2=4マス使用、残り5マス空き → 自由に移動可能
  ],
};

/** 標準 4×5 テスト用パズル */
const standardPuzzle: PuzzleDef = {
  id: 'test_standard',
  name: 'Standard',
  difficulty: 'beginner',
  board: { width: 4, height: 5 },
  exit: { x: 1, y: 5, width: 2, height: 1 },
  blocks: [
    { id: 'target', type: '2x2', x: 1, y: 0, isTarget: true },
    { id: 'a1', type: '1x2', x: 0, y: 0 },
    { id: 'a2', type: '1x2', x: 3, y: 0 },
    { id: 'b1', type: '2x1', x: 0, y: 2 },
    { id: 'b2', type: '2x1', x: 2, y: 2 },
    { id: 'c1', type: '1x2', x: 0, y: 3 },
    { id: 'c2', type: '1x2', x: 3, y: 3 },
    { id: 'd1', type: '1x1', x: 1, y: 3 },
    { id: 'd2', type: '1x1', x: 2, y: 3 },
    // 空き: (1,4) と (2,4)
  ],
};

describe('Board', () => {
  describe('constructor / createBlock', () => {
    it('パズル定義から正しくブロックを生成する', () => {
      const board = new Board(standardPuzzle);
      expect(board.width).toBe(4);
      expect(board.height).toBe(5);
      expect(board.blocks).toHaveLength(9);
      expect(board.state).toBe('playing');
      expect(board.moveCount).toBe(0);
    });

    it('ターゲットブロックのサイズが正しい', () => {
      const board = new Board(standardPuzzle);
      const target = board.blocks.find((b) => b.isTarget);
      expect(target).toBeDefined();
      expect(target!.w).toBe(2);
      expect(target!.h).toBe(2);
    });
  });

  describe('getBlockAt', () => {
    it('ブロックが存在する座標でブロックを返す', () => {
      const board = new Board(standardPuzzle);
      const block = board.getBlockAt(1, 0);
      expect(block).toBeDefined();
      expect(block!.id).toBe('target');
    });

    it('2×2ブロックの内部座標でもブロックを返す', () => {
      const board = new Board(standardPuzzle);
      expect(board.getBlockAt(2, 1)?.id).toBe('target');
    });

    it('空きマスでは undefined を返す', () => {
      const board = new Board(standardPuzzle);
      expect(board.getBlockAt(1, 4)).toBeUndefined();
      expect(board.getBlockAt(2, 4)).toBeUndefined();
    });
  });

  describe('getMaxSlide', () => {
    it('空きスペースの方向に移動可能', () => {
      const board = new Board(standardPuzzle);
      const d1 = board.blocks.find((b) => b.id === 'd1')!;
      // d1 は (1,3), 下に空き (1,4) がある
      expect(board.getMaxSlide(d1, 'down')).toBe(1);
    });

    it('壁に向かって移動不可', () => {
      const board = new Board(standardPuzzle);
      const a1 = board.blocks.find((b) => b.id === 'a1')!;
      // a1 は (0,0), 左は壁
      expect(board.getMaxSlide(a1, 'left')).toBe(0);
    });

    it('他のブロックに向かって移動不可', () => {
      const board = new Board(standardPuzzle);
      const target = board.blocks.find((b) => b.isTarget)!;
      // target は (1,0), 右には a2 (3,0) → 移動不可
      expect(board.getMaxSlide(target, 'right')).toBe(0);
    });
  });

  describe('moveBlock', () => {
    it('有効な方向に移動できる', () => {
      const board = new Board(standardPuzzle);
      // d1 (1,3) → 下に1マス移動
      const moved = board.moveBlock('d1', 'down', 1);
      expect(moved).toBe(true);
      const d1 = board.blocks.find((b) => b.id === 'd1')!;
      expect(d1.y).toBe(4);
      expect(board.moveCount).toBe(1);
    });

    it('距離が最大を超えた場合、最大距離まで移動する', () => {
      const board = new Board(standardPuzzle);
      // d1 (1,3) → 下に最大1マスだが、5マス指定
      const moved = board.moveBlock('d1', 'down', 5);
      expect(moved).toBe(true);
      const d1 = board.blocks.find((b) => b.id === 'd1')!;
      expect(d1.y).toBe(4); // 1マスだけ移動
    });

    it('移動不可能な方向では false を返す', () => {
      const board = new Board(standardPuzzle);
      const moved = board.moveBlock('target', 'up', 1);
      expect(moved).toBe(false);
      expect(board.moveCount).toBe(0);
    });

    it('存在しないブロックIDでは false を返す', () => {
      const board = new Board(standardPuzzle);
      expect(board.moveBlock('nonexistent', 'down', 1)).toBe(false);
    });

    it('履歴に操作が記録される', () => {
      const board = new Board(standardPuzzle);
      board.moveBlock('d1', 'down', 1);
      expect(board.history).toHaveLength(1);
      expect(board.history[0]).toEqual({
        blockId: 'd1',
        direction: 'down',
        distance: 1,
      });
    });
  });

  describe('クリア判定', () => {
    it('ターゲットが盤面最下行のEXIT位置に到達するとcleared', () => {
      const board = new Board(simplePuzzle);
      // simplePuzzle: 3×3, target 2×2 at (0,0), exit x=0
      // clear condition: target.x === 0 && target.y + 2 === 3 → target.y = 1
      board.moveBlock('target', 'down', 1);
      expect(board.state).toBe('cleared');
    });

    it('ターゲットがEXIT x と合わなければクリアにならない', () => {
      const board = new Board(simplePuzzle);
      // 右に移動してからだとx=1, exitのx=0と合わない
      board.moveBlock('target', 'right', 1);
      board.moveBlock('target', 'down', 1);
      expect(board.state).toBe('playing');
    });

    it('cleared後は操作できない', () => {
      const board = new Board(simplePuzzle);
      board.moveBlock('target', 'down', 1);
      expect(board.state).toBe('cleared');
      const moved = board.moveBlock('target', 'right', 1);
      expect(moved).toBe(false);
    });
  });

  describe('undo', () => {
    it('一手戻しで元の位置に戻る', () => {
      const board = new Board(standardPuzzle);
      board.moveBlock('d1', 'down', 1);
      expect(board.blocks.find((b) => b.id === 'd1')!.y).toBe(4);

      const undone = board.undo();
      expect(undone).toBe(true);
      expect(board.blocks.find((b) => b.id === 'd1')!.y).toBe(3);
      expect(board.moveCount).toBe(0);
    });

    it('履歴がなければ false を返す', () => {
      const board = new Board(standardPuzzle);
      expect(board.undo()).toBe(false);
    });

    it('クリア後にアンドゥするとplaying状態に戻る', () => {
      const board = new Board(simplePuzzle);
      board.moveBlock('target', 'down', 1);
      expect(board.state).toBe('cleared');

      board.undo();
      expect(board.state).toBe('playing');
    });
  });

  describe('reset', () => {
    it('リセットで初期状態に戻る', () => {
      const board = new Board(standardPuzzle);
      board.moveBlock('d1', 'down', 1);
      board.moveBlock('d2', 'down', 1);
      expect(board.moveCount).toBe(2);

      board.reset(standardPuzzle);
      expect(board.moveCount).toBe(0);
      expect(board.history).toHaveLength(0);
      expect(board.state).toBe('playing');
      expect(board.blocks.find((b) => b.id === 'd1')!.y).toBe(3);
    });
  });
});
