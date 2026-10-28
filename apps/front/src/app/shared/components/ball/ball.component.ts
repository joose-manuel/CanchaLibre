import { Component, input } from '@angular/core';

export type BallAnimation = 'none' | 'spin' | 'bounce';

@Component({
  selector: 'cl-ball',
  templateUrl: './ball.component.html',
  styleUrl: './ball.component.scss',
  host: {
    role: 'img',
    'aria-label': 'Balón de fútbol',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class BallComponent {
  readonly size = input(48);
  readonly animation = input<BallAnimation>('none');
}
