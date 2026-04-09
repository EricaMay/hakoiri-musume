import type { Block, Direction } from '../game/types';
import { Board } from '../game/Board';
import { Renderer } from '../render/Renderer';

/** 入力ハンドラー — マウス / タッチ操作でブロックをスワイプ移動 */
export class InputHandler {
  private board: Board;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private dragging: {
    block: Block;
    startGx: number;
    startGy: number;
    lastCx: number;
    lastCy: number;
  } | null = null;
  private onMoveCallback: (() => void) | null = null;
  enabled: boolean = true;

  constructor(canvas: HTMLCanvasElement, board: Board, renderer: Renderer) {
    this.canvas = canvas;
    this.board = board;
    this.renderer = renderer;

    canvas.addEventListener('mousedown', this.onPointerDown);
    canvas.addEventListener('mousemove', this.onPointerMove);
    canvas.addEventListener('mouseup', this.onPointerUp);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd);
  }

  onMove(callback: () => void): void {
    this.onMoveCallback = callback;
  }

  setBoard(board: Board): void {
    this.board = board;
  }

  private canvasPos(e: MouseEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  private touchPos(e: TouchEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    const t = e.touches[0] ?? e.changedTouches[0];
    return [t.clientX - r.left, t.clientY - r.top];
  }

  // --- マウスイベント ---
  private onPointerDown = (e: MouseEvent): void => {
    this.startDrag(...this.canvasPos(e));
  };
  private onPointerMove = (e: MouseEvent): void => {
    if (!this.dragging) return;
    const [cx, cy] = this.canvasPos(e);
    this.dragging.lastCx = cx;
    this.dragging.lastCy = cy;
  };
  private onPointerUp = (e: MouseEvent): void => {
    this.endDrag(...this.canvasPos(e));
  };

  // --- タッチイベント ---
  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.startDrag(...this.touchPos(e));
  };
  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (!this.dragging) return;
    const [cx, cy] = this.touchPos(e);
    this.dragging.lastCx = cx;
    this.dragging.lastCy = cy;
  };
  private onTouchEnd = (e: TouchEvent): void => {
    const [cx, cy] = this.dragging
      ? [this.dragging.lastCx, this.dragging.lastCy]
      : this.touchPos(e);
    this.endDrag(cx, cy);
  };

  // --- ドラッグロジック ---
  private startDrag(cx: number, cy: number): void {
    if (!this.enabled || this.board.state !== 'playing') return;
    if (this.renderer.isAnimating) return;
    const { gx, gy } = this.renderer.canvasToGrid(cx, cy);
    const block = this.board.getBlockAt(Math.floor(gx), Math.floor(gy));
    if (!block) return;

    this.dragging = { block, startGx: gx, startGy: gy, lastCx: cx, lastCy: cy };
  }

  private endDrag(endCx: number, endCy: number): void {
    if (!this.dragging) return;

    const { gx: endGx, gy: endGy } = this.renderer.canvasToGrid(endCx, endCy);
    const dx = endGx - this.dragging.startGx;
    const dy = endGy - this.dragging.startGy;

    const threshold = 0.25; // グリッド単位の最小スワイプ量
    if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
      let dir: Direction;
      let distance: number;

      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'right' : 'left';
        distance = Math.max(1, Math.round(Math.abs(dx)));
      } else {
        dir = dy > 0 ? 'down' : 'up';
        distance = Math.max(1, Math.round(Math.abs(dy)));
      }

      // アニメーション用に移動前の位置を記録
      const block = this.dragging.block;
      const fromX = block.x;
      const fromY = block.y;

      const moved = this.board.moveBlock(block.id, dir, distance);
      if (moved) {
        // 移動後の位置を取得してアニメーション開始
        const movedBlock = this.board.blocks.find(b => b.id === block.id);
        if (movedBlock) {
          this.renderer.startAnimation(
            block.id, fromX, fromY, movedBlock.x, movedBlock.y,
            () => this.onMoveCallback?.(),
          );
        } else {
          this.onMoveCallback?.();
        }
      }
    }

    this.dragging = null;
  }

  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.onPointerDown);
    this.canvas.removeEventListener('mousemove', this.onPointerMove);
    this.canvas.removeEventListener('mouseup', this.onPointerUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
  }
}
