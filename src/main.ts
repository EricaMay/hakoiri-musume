import './style.css';
import type { PuzzleDef } from './game/types';
import { ScreenManager } from './ui/ScreenManager';
import puzzlesData from './data/puzzles.json';

const app = document.getElementById('app')!;

// UI コンテナ
const uiContainer = document.createElement('div');
uiContainer.id = 'ui';
app.appendChild(uiContainer);

// Canvas
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.style.display = 'none';
app.appendChild(canvas);

// パズルデータ読み込み & 起動
const puzzles = puzzlesData as PuzzleDef[];
const screen = new ScreenManager(canvas, uiContainer, puzzles);
screen.start();

