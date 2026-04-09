import type { Direction } from '../game/types';

export type ReplaySpeed = 'slow' | 'normal' | 'fast';

interface ReplayStep {
  blockId: string;
  direction: Direction;
}

const SPEED_DELAYS: Record<ReplaySpeed, number> = {
  slow: 500,
  normal: 250,
  fast: 100,
};

const SPEED_LABELS: Record<ReplaySpeed, string> = {
  slow: '🐢 遅い',
  normal: '普通',
  fast: '🐇 速い',
};

const SPEED_ORDER: ReplaySpeed[] = ['slow', 'normal', 'fast'];

/** リプレイ状態管理 */
export class ReplayController {
  private steps: ReplayStep[] = [];
  private currentIndex = 0;
  private paused = false;
  private stopped = false;
  private speed: ReplaySpeed = 'normal';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onStepCb: ((step: ReplayStep, index: number) => Promise<void>) | null = null;
  private onCompleteCb: (() => void) | null = null;

  get isActive(): boolean {
    return this.steps.length > 0 && !this.stopped;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get progress(): { current: number; total: number } {
    return { current: this.currentIndex, total: this.steps.length };
  }

  get currentSpeed(): ReplaySpeed {
    return this.speed;
  }

  /** リプレイ開始 */
  start(
    steps: ReplayStep[],
    onStep: (step: ReplayStep, index: number) => Promise<void>,
    onComplete: () => void,
  ): void {
    this.steps = steps;
    this.currentIndex = 0;
    this.paused = false;
    this.stopped = false;
    this.onStepCb = onStep;
    this.onCompleteCb = onComplete;
    this.scheduleNext();
  }

  pause(): void {
    this.paused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.scheduleNext();
  }

  stop(): void {
    this.stopped = true;
    this.paused = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.onCompleteCb?.();
    this.onStepCb = null;
    this.onCompleteCb = null;
  }

  setSpeed(speed: ReplaySpeed): void {
    this.speed = speed;
  }

  /** 次の速度に切り替え、新しいラベルを返す */
  cycleSpeed(): string {
    const idx = SPEED_ORDER.indexOf(this.speed);
    this.speed = SPEED_ORDER[(idx + 1) % SPEED_ORDER.length];
    return SPEED_LABELS[this.speed];
  }

  static speedLabel(speed: ReplaySpeed): string {
    return SPEED_LABELS[speed];
  }

  private scheduleNext(): void {
    if (this.stopped || this.paused) return;
    if (this.currentIndex >= this.steps.length) {
      this.onCompleteCb?.();
      this.onStepCb = null;
      this.onCompleteCb = null;
      return;
    }

    const step = this.steps[this.currentIndex];
    this.onStepCb?.(step, this.currentIndex).then(() => {
      this.currentIndex++;
      if (this.stopped || this.paused) return;
      if (this.currentIndex >= this.steps.length) {
        this.onCompleteCb?.();
        this.onStepCb = null;
        this.onCompleteCb = null;
        return;
      }
      this.timer = setTimeout(() => this.scheduleNext(), SPEED_DELAYS[this.speed]);
    });
  }
}
