import type { Block } from '../game/types';
import { Board } from '../game/Board';

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

  /** 個別ブロック描画 */
  private drawBlock(block: Block, color: string): void {
    const { ctx, config } = this;
    const cs = config.cellSize;
    const r = config.borderRadius;
    const gap = 3;

    const px = this.offsetX + block.x * cs + gap;
    const py = this.offsetY + block.y * cs + gap;
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
}
