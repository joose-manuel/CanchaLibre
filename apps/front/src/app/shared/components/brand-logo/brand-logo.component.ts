import { Component, computed, input } from '@angular/core';
import { BallAnimation, BallComponent } from '../ball/ball.component';

@Component({
  selector: 'cl-brand-logo',
  imports: [BallComponent],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.scss',
  host: {
    role: 'img',
    'aria-label': 'CanchaLibre',
    '[style.--cl-brand-size]': "size() + 'px'",
  },
})
export class BrandLogoComponent {
  readonly size = input(96);
  readonly wordmark = input(true);
  readonly intro = input(false);
  readonly ballAnimation = input<BallAnimation>('none');

  protected readonly ballSize = computed(() => Math.round(this.size() * 0.5));
}
