/** パズルごとの進捗データ */
export interface PuzzleProgress {
  cleared: boolean;
  bestMoves: number;
  clearCount: number;
}

type ProgressData = Record<string, PuzzleProgress>;

const STORAGE_KEY = 'hakoiri-musume-progress';

/** localStorage ベースの進捗管理 */
export class ProgressStore {
  private data: ProgressData;

  constructor() {
    this.data = this.load();
  }

  /** パズルの進捗を取得 */
  get(puzzleId: string): PuzzleProgress | undefined {
    return this.data[puzzleId];
  }

  /** クリア時に記録を保存 */
  recordClear(puzzleId: string, moves: number): void {
    const existing = this.data[puzzleId];
    if (existing) {
      existing.cleared = true;
      existing.clearCount++;
      if (moves < existing.bestMoves) {
        existing.bestMoves = moves;
      }
    } else {
      this.data[puzzleId] = {
        cleared: true,
        bestMoves: moves,
        clearCount: 1,
      };
    }
    this.save();
  }

  private load(): ProgressData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ProgressData;
    } catch (e) {
      console.warn('[ProgressStore] 進捗データの読込に失敗:', e);
    }
    return {};
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[ProgressStore] 進捗データの保存に失敗:', e);
    }
  }
}
