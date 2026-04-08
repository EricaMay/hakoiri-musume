import type { PuzzleDef, Block, ExitDef } from './types';
import type { SolveResult } from './Solver';

/** Worker へのリクエストメッセージ */
interface SolveRequest {
  id: number;
  puzzle: PuzzleDef;
  maxStates?: number;
}

/** Worker からのレスポンスメッセージ */
interface SolveResponse {
  id: number;
  result: SolveResult;
}

/** Solver Web Worker の Promise ベースクライアント */
export class SolverClient {
  private worker: Worker;
  private nextId = 0;
  private pending = new Map<number, {
    resolve: (result: SolveResult) => void;
    reject: (error: Error) => void;
  }>();

  constructor() {
    this.worker = new Worker(
      new URL('./solver.worker.ts', import.meta.url),
      { type: 'module' },
    );
    this.worker.addEventListener('message', this.onMessage);
    this.worker.addEventListener('error', this.onError);
  }

  /** PuzzleDef からパズルを解く */
  solve(puzzle: PuzzleDef, maxStates?: number): Promise<SolveResult> {
    return this.postRequest(puzzle, maxStates);
  }

  /** 現在の盤面状態（Block[]）からパズルを解く（ヒント用） */
  solveFromState(
    blocks: Block[],
    boardSize: { width: number; height: number },
    exit: ExitDef,
    maxStates?: number,
  ): Promise<SolveResult> {
    const puzzle: PuzzleDef = {
      id: '_hint',
      name: '_hint',
      difficulty: 'beginner',
      board: boardSize,
      exit,
      blocks: blocks.map((b) => ({
        id: b.id,
        type: b.type,
        x: b.x,
        y: b.y,
        isTarget: b.isTarget || undefined,
      })),
    };
    return this.postRequest(puzzle, maxStates);
  }

  /** Worker を終了 */
  dispose(): void {
    this.worker.terminate();
    for (const { reject } of this.pending.values()) {
      reject(new Error('SolverClient disposed'));
    }
    this.pending.clear();
  }

  private postRequest(puzzle: PuzzleDef, maxStates?: number): Promise<SolveResult> {
    const id = this.nextId++;
    return new Promise<SolveResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const request: SolveRequest = { id, puzzle, maxStates };
      this.worker.postMessage(request);
    });
  }

  private onMessage = (e: MessageEvent<SolveResponse>): void => {
    const { id, result } = e.data;
    const handler = this.pending.get(id);
    if (handler) {
      this.pending.delete(id);
      handler.resolve(result);
    }
  };

  private onError = (e: ErrorEvent): void => {
    for (const { reject } of this.pending.values()) {
      reject(new Error(e.message));
    }
    this.pending.clear();
  };
}
