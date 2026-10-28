import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatchSummary } from '../../interfaces/match-summary.interface';

@Component({
  selector: 'cl-match-detail',
  templateUrl: './match-detail.component.html',
  styleUrl: './match-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchDetailComponent {
  readonly match = input.required<MatchSummary>();
  readonly closing = input(false);
  readonly closed = output<void>();
}
