import type { Direction, PuzzleDef } from './types';
import { BLOCK_SIZES } from './types';

/** ソルバーの解答結果 */
export interface SolveResult {
  solvable: boolean;
  minMoves: number;
  /** 最短手順（blockId, direction のペア） */
  steps: { blockId: string; direction: Direction }[];
}

/** 内部状態: ブロック位置の配列 */
interface SolverBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isTarget: boolean;
}

type Step = { blockId: string; direction: Direction };

/** BFS（幅優先探索）でスライドパズルの最短解を求めるソルバー */
export class Solver {
  private puzzle: PuzzleDef;
  private width: number;
  private height: number;
  private exitX: number;

  constructor(puzzle: PuzzleDef) {
    this.puzzle = puzzle;
    this.width = puzzle.board.width;
    this.height = puzzle.board.height;
    this.exitX = puzzle.exit.x;
  }

  /** パズルを解く。解けない場合は solvable: false を返す */
  solve(maxStates: number = 500_000): SolveResult {
    const initial = this.initBlocks();
    const initialKey = this.stateKey(initial);

    // BFS
    const visited = new Set<string>([initialKey]);
    const queue: { blocks: SolverBlock[]; steps: Step[] }[] = [
      { blocks: initial, steps: [] },
    ];

    while (queue.length > 0) {
      const { blocks, steps } = queue.shift()!;

      if (this.isClear(blocks)) {
        return { solvable: true, minMoves: steps.length, steps };
      }

      if (visited.size >= maxStates) {
        break; // 探索打ち切り
      }

      // 全ブロック × 4方向 × 1マスの移動を試す
      const dirs: Direction[] = ['up', 'down', 'left', 'right'];
      for (const block of blocks) {
        for (const dir of dirs) {
          if (!this.canMove(blocks, block, dir)) continue;

          const newBlocks = this.applyMove(blocks, block.id, dir);
          const key = this.stateKey(newBlocks);
          if (visited.has(key)) continue;

          visited.add(key);
          queue.push({
            blocks: newBlocks,
            steps: [...steps, { blockId: block.id, direction: dir }],
          });
        }
      }
    }

    return { solvable: false, minMoves: -1, steps: [] };
  }

  /** PuzzleDef からソルバー用ブロック配列を生成 */
  private initBlocks(): SolverBlock[] {
    return this.puzzle.blocks.map((b) => {
      const size = BLOCK_SIZES[b.type];
      return {
        id: b.id,
        x: b.x,
        y: b.y,
        w: size.w,
        h: size.h,
        isTarget: b.isTarget ?? false,
      };
    });
  }

  /** 盤面状態をハッシュキーに変換 */
  private stateKey(blocks: SolverBlock[]): string {
    // ターゲットは先頭に、それ以外は同サイズ同士を位置でソート
    const target = blocks.find((b) => b.isTarget)!;
    const others = blocks
      .filter((b) => !b.isTarget)
      .map((b) => `${b.w}${b.h}${b.x},${b.y}`)
      .sort();
    return `${target.x},${target.y}|${others.join('|')}`;
  }

  /** クリア条件: ターゲットが盤面最下行でEXIT x に揃っている */
  private isClear(blocks: SolverBlock[]): boolean {
    const target = blocks.find((b) => b.isTarget);
    if (!target) return false;
    return target.x === this.exitX && target.y + target.h === this.height;
  }

  /** ブロックが指定方向に1マス移動可能か */
  private canMove(blocks: SolverBlock[], block: SolverBlock, dir: Direction): boolean {
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const nx = block.x + dx;
    const ny = block.y + dy;

    // 盤面境界チェック
    if (nx < 0 || ny < 0 || nx + block.w > this.width || ny + block.h > this.height) {
      return false;
    }

    // 他ブロックとの衝突チェック
    for (const other of blocks) {
      if (other.id === block.id) continue;
      if (
        nx < other.x + other.w &&
        nx + block.w > other.x &&
        ny < other.y + other.h &&
        ny + block.h > other.y
      ) {
        return false;
      }
    }

    return true;
  }

  /** ブロックを1マス移動した新しい状態を生成 */
  private applyMove(blocks: SolverBlock[], blockId: string, dir: Direction): SolverBlock[] {
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;

    return blocks.map((b) => {
      if (b.id !== blockId) return { ...b };
      return { ...b, x: b.x + dx, y: b.y + dy };
    });
  }
}
