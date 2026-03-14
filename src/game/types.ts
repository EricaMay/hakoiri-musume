/** ブロックの種類 */
export type BlockType = '1x1' | '1x2' | '2x1' | '2x2';

/** ブロックのサイズ定義 */
export const BLOCK_SIZES: Record<BlockType, { w: number; h: number }> = {
  '1x1': { w: 1, h: 1 },
  '1x2': { w: 1, h: 2 },
  '2x1': { w: 2, h: 1 },
  '2x2': { w: 2, h: 2 },
};

/** ブロック定義 */
export interface BlockDef {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  isTarget?: boolean;
}

/** EXIT（出口）定義 */
export interface ExitDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** パズル定義 */
export interface PuzzleDef {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  board: { width: number; height: number };
  exit: ExitDef;
  blocks: BlockDef[];
}

/** ブロック実行時状態 */
export interface Block {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  isTarget: boolean;
}

/** 移動方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 移動操作 */
export interface Move {
  blockId: string;
  direction: Direction;
  distance: number;
}

/** ゲーム状態 */
export type GameState = 'playing' | 'cleared';

/** 画面種別 */
export type ScreenType = 'title' | 'select' | 'game' | 'clear';
