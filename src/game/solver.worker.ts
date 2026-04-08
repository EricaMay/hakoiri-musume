import type { PuzzleDef } from './types';
import { Solver } from './Solver';
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

self.onmessage = (e: MessageEvent<SolveRequest>) => {
  const { id, puzzle, maxStates } = e.data;
  const solver = new Solver(puzzle);
  const result = solver.solve(maxStates);
  const response: SolveResponse = { id, result };
  self.postMessage(response);
};
