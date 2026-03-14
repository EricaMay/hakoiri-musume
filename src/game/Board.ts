import type { Block, BlockDef, Direction, ExitDef, Move, PuzzleDef, GameState } from './types';
import { BLOCK_SIZES } from './types';

/** 盤面管理クラス — コアゲームロジック */
export class Board {
  readonly width: number;
  readonly height: number;
  readonly exit: ExitDef;
  blocks: Block[];
  moveCount: number;
  history: Move[];
  state: GameState;

  constructor(puzzle: PuzzleDef) {
    this.width = puzzle.board.width;
    this.height = puzzle.board.height;
    this.exit = { ...puzzle.exit };
    this.blocks = puzzle.blocks.map((b) => Board.createBlock(b));
    this.moveCount = 0;
    this.history = [];
    this.state = 'playing';
  }

  /** BlockDef から実行時 Block を生成 */
  static createBlock(def: BlockDef): Block {
    const size = BLOCK_SIZES[def.type];
    return {
      id: def.id,
      type: def.type,
      x: def.x,
      y: def.y,
      w: size.w,
      h: size.h,
      isTarget: def.isTarget ?? false,
    };
  }

  /** 指定座標にあるブロックを取得 */
  getBlockAt(gx: number, gy: number): Block | undefined {
    return this.blocks.find(
      (b) => gx >= b.x && gx < b.x + b.w && gy >= b.y && gy < b.y + b.h,
    );
  }

  /** 指定ブロックが指定方向に最大何マス移動可能か */
  getMaxSlide(block: Block, dir: Direction): number {
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    let maxDist = 0;

    for (let dist = 1; ; dist++) {
      const nx = block.x + dx * dist;
      const ny = block.y + dy * dist;

      // 盤面境界チェック
      if (nx < 0 || ny < 0 || nx + block.w > this.width || ny + block.h > this.height) {
        break;
      }

      // 他ブロックとの衝突チェック
      if (this.collides(block, nx, ny)) {
        break;
      }

      maxDist = dist;
    }

    return maxDist;
  }

  /** ブロックを (nx, ny) に置いた場合、他のブロックと衝突するか */
  private collides(block: Block, nx: number, ny: number): boolean {
    for (const other of this.blocks) {
      if (other.id === block.id) continue;
      if (
        nx < other.x + other.w &&
        nx + block.w > other.x &&
        ny < other.y + other.h &&
        ny + block.h > other.y
      ) {
        return true;
      }
    }
    return false;
  }

  /** ブロックを移動（距離指定） */
  moveBlock(blockId: string, dir: Direction, distance: number): boolean {
    if (this.state !== 'playing') return false;

    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return false;

    const maxSlide = this.getMaxSlide(block, dir);
    const actualDist = Math.min(distance, maxSlide);
    if (actualDist <= 0) return false;

    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;

    block.x += dx * actualDist;
    block.y += dy * actualDist;
    this.moveCount++;
    this.history.push({ blockId, direction: dir, distance: actualDist });

    if (this.checkClear()) {
      this.state = 'cleared';
    }

    return true;
  }

  /** アンドゥ（一手戻し） */
  undo(): boolean {
    const last = this.history.pop();
    if (!last) return false;

    const block = this.blocks.find((b) => b.id === last.blockId);
    if (!block) return false;

    const dx = last.direction === 'left' ? 1 : last.direction === 'right' ? -1 : 0;
    const dy = last.direction === 'up' ? 1 : last.direction === 'down' ? -1 : 0;

    block.x += dx * last.distance;
    block.y += dy * last.distance;
    this.moveCount--;
    this.state = 'playing';

    return true;
  }

  /** クリア判定 — ターゲットブロックが盤面最下行でEXIT x に揃っているか */
  private checkClear(): boolean {
    const target = this.blocks.find((b) => b.isTarget);
    if (!target) return false;

    return (
      target.x === this.exit.x &&
      target.y + target.h === this.height
    );
  }

  /** パズルをリセット */
  reset(puzzle: PuzzleDef): void {
    this.blocks = puzzle.blocks.map((b) => Board.createBlock(b));
    this.moveCount = 0;
    this.history = [];
    this.state = 'playing';
  }
}
