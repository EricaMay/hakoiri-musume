import type { PuzzleDef, ScreenType } from '../game/types';
import { Board } from '../game/Board';
import { Renderer } from '../render/Renderer';
import { InputHandler } from '../input/InputHandler';
import { ProgressStore } from '../data/ProgressStore';

/** 最小手数を PuzzleDef から取得 */
function getMinMoves(puzzle: PuzzleDef): number | undefined {
  return puzzle._minMoves;
}

/** 星評価を計算 */
function calcStars(moves: number, minMoves: number | undefined): number {
  if (!minMoves || minMoves <= 0) return 1;
  const ratio = moves / minMoves;
  if (ratio <= 1.5) return 3;
  if (ratio <= 2.5) return 2;
  return 1;
}

/** 画面遷移管理 */
export class ScreenManager {
  currentScreen: ScreenType;
  private puzzles: PuzzleDef[];
  private currentPuzzleIndex: number = 0;
  private board: Board | null = null;
  private renderer: Renderer | null = null;
  private input: InputHandler | null = null;
  private canvas: HTMLCanvasElement;
  private uiContainer: HTMLDivElement;
  private animFrameId: number = 0;
  private progress: ProgressStore;

  constructor(canvas: HTMLCanvasElement, uiContainer: HTMLDivElement, puzzles: PuzzleDef[]) {
    this.canvas = canvas;
    this.uiContainer = uiContainer;
    this.puzzles = puzzles;
    this.currentScreen = 'select';
    this.progress = new ProgressStore();
  }

  start(): void {
    this.showSelect();
  }

  private showSelect(): void {
    this.currentScreen = 'select';
    this.stopGameLoop();
    this.canvas.style.display = 'none';

    this.uiContainer.innerHTML = '';
    const title = document.createElement('h1');
    title.textContent = '箱入り娘';
    title.className = 'title';
    this.uiContainer.appendChild(title);

    const list = document.createElement('div');
    list.className = 'puzzle-list';

    this.puzzles.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'puzzle-btn';

      const prog = this.progress.get(p.id);
      const clearMark = prog?.cleared ? '✓ ' : '';
      const bestLabel = prog?.bestMoves ? ` (最少: ${prog.bestMoves}手)` : '';

      btn.innerHTML = `<span class="puzzle-name">${clearMark}${p.name}${bestLabel}</span><span class="puzzle-diff">${this.diffLabel(p.difficulty)}</span>`;
      btn.addEventListener('click', () => this.startGame(i));
      list.appendChild(btn);
    });

    this.uiContainer.appendChild(list);
  }

  private startGame(index: number): void {
    this.currentScreen = 'game';
    this.currentPuzzleIndex = index;
    const puzzle = this.puzzles[index];

    this.uiContainer.innerHTML = '';
    this.canvas.style.display = 'block';

    // ヘッダー UI
    const header = document.createElement('div');
    header.className = 'game-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'header-btn';
    backBtn.textContent = '← 戻る';
    backBtn.addEventListener('click', () => this.showSelect());

    const info = document.createElement('div');
    info.className = 'game-info';
    const minMoves = getMinMoves(puzzle);
    const minMovesLabel = minMoves != null ? `<span class="min-moves">最短: ${minMoves}手</span>` : '';
    info.innerHTML = `<span class="puzzle-title">${puzzle.name}</span><span id="move-count">手数: 0</span>${minMovesLabel}`;

    const controls = document.createElement('div');
    controls.className = 'game-controls';

    const undoBtn = document.createElement('button');
    undoBtn.className = 'header-btn';
    undoBtn.textContent = '↩ 戻す';
    undoBtn.addEventListener('click', () => {
      this.board?.undo();
      this.updateUI();
    });

    const resetBtn = document.createElement('button');
    resetBtn.className = 'header-btn';
    resetBtn.textContent = '⟲ リセット';
    resetBtn.addEventListener('click', () => {
      this.board?.reset(puzzle);
      this.updateUI();
    });

    controls.appendChild(undoBtn);
    controls.appendChild(resetBtn);

    header.appendChild(backBtn);
    header.appendChild(info);
    header.appendChild(controls);
    this.uiContainer.appendChild(header);

    // ゲーム初期化
    this.board = new Board(puzzle);
    this.renderer = new Renderer(this.canvas);
    this.renderer.resize(
      puzzle.board.width,
      puzzle.board.height,
      window.innerWidth,
      window.innerHeight,
    );

    if (this.input) this.input.destroy();
    this.input = new InputHandler(this.canvas, this.board, this.renderer);
    this.input.onMove(() => this.updateUI());

    // リサイズ対応
    window.addEventListener('resize', this.onResize);

    this.startGameLoop();
  }

  private onResize = (): void => {
    if (!this.board || !this.renderer) return;
    this.renderer.resize(
      this.board.width,
      this.board.height,
      window.innerWidth,
      window.innerHeight,
    );
  };

  private startGameLoop(): void {
    const loop = (): void => {
      if (this.board && this.renderer) {
        this.renderer.render(this.board);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private stopGameLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    window.removeEventListener('resize', this.onResize);
  }

  private updateUI(): void {
    if (!this.board) return;

    const el = document.getElementById('move-count');
    if (el) el.textContent = `手数: ${this.board.moveCount}`;

    if (this.board.state === 'cleared') {
      this.showClear();
    }
  }

  private showClear(): void {
    this.currentScreen = 'clear';

    const puzzle = this.puzzles[this.currentPuzzleIndex];
    const moves = this.board!.moveCount;
    const minMoves = getMinMoves(puzzle);
    const stars = calcStars(moves, minMoves);

    // 記録を保存
    this.progress.recordClear(puzzle.id, moves);

    const overlay = document.createElement('div');
    overlay.className = 'clear-overlay';

    const msg = document.createElement('div');
    msg.className = 'clear-message';

    const starsStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    const optimalLine = minMoves
      ? `<p class="clear-optimal">最短 ${minMoves} 手 / あなた ${moves} 手</p>`
      : '';

    msg.innerHTML = `
      <h2>🎉 クリア！</h2>
      <p class="clear-stars">${starsStr}</p>
      <p>手数: ${moves}</p>
      ${optimalLine}
    `;

    const btnRow = document.createElement('div');
    btnRow.className = 'clear-buttons';

    if (this.currentPuzzleIndex < this.puzzles.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'puzzle-btn';
      nextBtn.textContent = '次の問題 →';
      nextBtn.addEventListener('click', () => {
        overlay.remove();
        this.startGame(this.currentPuzzleIndex + 1);
      });
      btnRow.appendChild(nextBtn);
    }

    const selectBtn = document.createElement('button');
    selectBtn.className = 'puzzle-btn secondary';
    selectBtn.textContent = '問題一覧に戻る';
    selectBtn.addEventListener('click', () => {
      overlay.remove();
      this.showSelect();
    });
    btnRow.appendChild(selectBtn);

    msg.appendChild(btnRow);
    overlay.appendChild(msg);
    this.uiContainer.appendChild(overlay);
  }

  private diffLabel(d: string): string {
    const map: Record<string, string> = {
      beginner: '★☆☆☆',
      intermediate: '★★☆☆',
      advanced: '★★★☆',
      expert: '★★★★',
    };
    return map[d] ?? d;
  }
}
