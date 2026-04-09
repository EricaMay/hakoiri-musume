import type { Block, Direction } from '../game/types';
import { Board } from '../game/Board';

/** ブロック移動アニメーション状態 */
interface BlockAnimation {
  blockId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startTime: number;
  duration: number;
}

/** Canvas描画設定 */
export interface RenderConfig {
  cellSize: number;
  padding: number;
  borderRadius: number;
  colors: {
    background: string;
    grid: string;
    exit: string;
    target: string;
    block: string[];
    blockStroke: string;
    text: string;
  };
}

const DEFAULT_CONFIG: RenderConfig = {
  cellSize: 80,
  padding: 16,
  borderRadius: 8,
  colors: {
    background: '#1a1a2e',
    grid: '#16213e',
    exit: '#e94560',
    target: '#e94560',
    block: ['#0f3460', '#533483', '#2b6777', '#468189', '#7b2d8e'],
    blockStroke: '#e0e0e0',
    text: '#ffffff',
  },
};

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;
  /** 盤面描画エリアの左上オフセット（canvas内座標） */
  offsetX: number = 0;
  offsetY: number = 0;
  private animation: BlockAnimation | null = null;
  private animationCallback: (() => void) | null = null;
  private hintHighlightData: { blockId: string; direction: Direction } | null = null;

  constructor(canvas: HTMLCanvasElement, config?: Partial<RenderConfig>) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get cellSize(): number {
    return this.config.cellSize;
  }

  /** Canvasサイズを盤面に合わせて調整 */
  resize(boardWidth: number, boardHeight: number, containerWidth: number, containerHeight: number): void {
    const pad = this.config.padding;
    // EXITゾーン分の追加スペース（下部に1セル分）
    const extraBottom = this.config.cellSize;

    const availW = containerWidth - pad * 2;
    const availH = containerHeight - pad * 2 - extraBottom - 60; // 60px for header/UI

    const cellW = Math.floor(availW / boardWidth);
    const cellH = Math.floor(availH / boardHeight);
    this.config.cellSize = Math.min(cellW, cellH, 100); // max 100px

    const totalW = this.config.cellSize * boardWidth;
    const totalH = this.config.cellSize * boardHeight + extraBottom;

    this.canvas.width = totalW + pad * 2;
    this.canvas.height = totalH + pad * 2;
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;

    this.offsetX = pad;
    this.offsetY = pad;
  }

  /** 盤面全体を描画 */
  render(board: Board): void {
    const { ctx, config } = this;
    const { cellSize } = config;

    // 背景クリア
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // グリッド描画
    ctx.strokeStyle = config.colors.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= board.width; x++) {
      const px = this.offsetX + x * cellSize;
      ctx.beginPath();
      ctx.moveTo(px, this.offsetY);
      ctx.lineTo(px, this.offsetY + board.height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= board.height; y++) {
      const py = this.offsetY + y * cellSize;
      ctx.beginPath();
      ctx.moveTo(this.offsetX, py);
      ctx.lineTo(this.offsetX + board.width * cellSize, py);
      ctx.stroke();
    }

    // EXIT ゾーン描画
    this.drawExit(board);

    // ブロック描画
    let colorIdx = 0;
    for (const block of board.blocks) {
      if (block.isTarget) {
        this.drawBlock(block, config.colors.target);
      } else {
        this.drawBlock(block, config.colors.block[colorIdx % config.colors.block.length]);
        colorIdx++;
      }
    }

    // 盤面の外枠
    ctx.strokeStyle = config.colors.blockStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.offsetX,
      this.offsetY,
      board.width * cellSize,
      board.height * cellSize,
    );

    // ヒントハイライト
    if (this.hintHighlightData) {
      this.drawHintOverlay(board);
    }
  }

  /** EXIT ゾーンを描画 */
  private drawExit(board: Board): void {
    const { ctx, config } = this;
    const cs = config.cellSize;
    const ex = board.exit;

    const px = this.offsetX + ex.x * cs;
    const py = this.offsetY + board.height * cs; // 盤面の下

    ctx.fillStyle = config.colors.exit;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(px, py, ex.width * cs, cs);
    ctx.globalAlpha = 1.0;

    // EXIT ラベル
    ctx.fillStyle = config.colors.exit;
    ctx.font = `bold ${Math.floor(cs * 0.3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', px + (ex.width * cs) / 2, py + cs / 2);
  }

  /** 個別ブロック描画（アニメーション対応） */
  private drawBlock(block: Block, color: string): void {
    const { ctx, config } = this;
    const cs = config.cellSize;
    const r = config.borderRadius;
    const gap = 3;

    const animPos = this.getAnimatedPosition(block);
    const bx = animPos ? animPos.x : block.x;
    const by = animPos ? animPos.y : block.y;

    const px = this.offsetX + bx * cs + gap;
    const py = this.offsetY + by * cs + gap;
    const w = block.w * cs - gap * 2;
    const h = block.h * cs - gap * 2;

    // ブロック本体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, r);
    ctx.fill();

    // 枠線
    ctx.strokeStyle = config.colors.blockStroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, r);
    ctx.stroke();

    // ターゲットブロックにはアイコン描画
    if (block.isTarget) {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.floor(cs * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', px + w / 2, py + h / 2);
    }
  }

  /** グリッド座標 → Canvas座標 */
  gridToCanvas(gx: number, gy: number): { x: number; y: number } {
    return {
      x: this.offsetX + gx * this.config.cellSize,
      y: this.offsetY + gy * this.config.cellSize,
    };
  }

  /** Canvas座標 → グリッド座標 */
  canvasToGrid(cx: number, cy: number): { gx: number; gy: number } {
    return {
      gx: (cx - this.offsetX) / this.config.cellSize,
      gy: (cy - this.offsetY) / this.config.cellSize,
    };
  }

  /** ヒントハイライトを設定 */
  setHintHighlight(blockId: string, direction: Direction): void {
    this.hintHighlightData = { blockId, direction };
  }

  /** ヒントハイライトをクリア */
  clearHintHighlight(): void {
    this.hintHighlightData = null;
  }

  /** アニメーション中かどうか */
  get isAnimating(): boolean {
    return this.animation !== null;
  }

  /** ブロック移動アニメーションを開始 */
  startAnimation(blockId: string, fromX: number, fromY: number, toX: number, toY: number, onComplete?: () => void): void {
    this.animation = {
      blockId,
      fromX,
      fromY,
      toX,
      toY,
      startTime: performance.now(),
      duration: 120,
    };
    this.animationCallback = onComplete ?? null;
  }

  /** アニメーション中のブロック描画位置を取得（アニメなしなら null） */
  private getAnimatedPosition(block: Block): { x: number; y: number } | null {
    if (!this.animation || this.animation.blockId !== block.id) return null;

    const elapsed = performance.now() - this.animation.startTime;
    const t = Math.min(elapsed / this.animation.duration, 1);
    // ease-out
    const ease = 1 - (1 - t) * (1 - t);

    if (t >= 1) {
      const cb = this.animationCallback;
      this.animation = null;
      this.animationCallback = null;
      cb?.();
      return null;
    }

    return {
      x: this.animation.fromX + (this.animation.toX - this.animation.fromX) * ease,
      y: this.animation.fromY + (this.animation.toY - this.animation.fromY) * ease,
    };
  }

  /** ヒントハイライト描画（パルスボーダー + 方向矢印） */
  private drawHintOverlay(board: Board): void {
    if (!this.hintHighlightData) return;
    const { blockId, direction } = this.hintHighlightData;
    const block = board.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const { ctx, config } = this;
    const cs = config.cellSize;
    const r = config.borderRadius;
    const gap = 3;

    const px = this.offsetX + block.x * cs + gap;
    const py = this.offsetY + block.y * cs + gap;
    const w = block.w * cs - gap * 2;
    const h = block.h * cs - gap * 2;

    // パルスエフェクト
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);

    // 金色ボーダー
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4 + 0.6 * pulse;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12 * pulse;
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, r);
    ctx.stroke();
    ctx.restore();

    // 方向矢印
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * pulse;
    this.drawHintArrow(px + w / 2, py + h / 2, direction, Math.min(w, h) * 0.25);
    ctx.restore();
  }

  /** 方向矢印を描画 */
  private drawHintArrow(cx: number, cy: number, dir: Direction, size: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    const angles: Record<Direction, number> = {
      right: 0,
      down: Math.PI / 2,
      left: Math.PI,
      up: -Math.PI / 2,
    };
    ctx.rotate(angles[dir]);

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.3, -size * 0.5);
    ctx.lineTo(-size * 0.3, size * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
