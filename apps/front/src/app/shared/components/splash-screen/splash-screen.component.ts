import {
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ProgressBar } from 'primeng/progressbar';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

const FINISH_DELAY_MS = 400;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

@Component({
  selector: 'cl-splash-screen',
  imports: [ProgressBar, BrandLogoComponent],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent {
  readonly duration = input(2800);
  readonly tagline = input('RESERVA • JUEGA • GANA');
  readonly country = input('COLOMBIA');
  readonly version = input('v1.0.0');
  readonly finished = output<void>();

  protected readonly progress = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private frameId?: number;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.start());
    this.destroyRef.onDestroy(() => this.stop());
  }

  private start(): void {
    const startedAt = performance.now();
    const total = this.duration();

    const tick = (now: number) => {
      const ratio = Math.min((now - startedAt) / total, 1);
      this.progress.set(Math.round(easeOutCubic(ratio) * 100));

      if (ratio < 1) {
        this.frameId = requestAnimationFrame(tick);
      } else {
        this.timeoutId = setTimeout(
          () => this.finished.emit(),
          FINISH_DELAY_MS,
        );
      }
    };

    this.frameId = requestAnimationFrame(tick);
  }

  private stop(): void {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    clearTimeout(this.timeoutId);
  }
}
