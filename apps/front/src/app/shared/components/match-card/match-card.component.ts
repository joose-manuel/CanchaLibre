import { Component, computed, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { MatchSummary } from '../../interfaces/match-summary.interface';

@Component({
  selector: 'cl-match-card',
  imports: [Button, ProgressBar],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
})
export class MatchCardComponent {
  readonly match = input.required<MatchSummary>();
  readonly ctaLabel = input('Unirse al partido');
  readonly ctaSeverity = input<'primary' | 'secondary'>('secondary');
  readonly ctaDisabled = input(false);
  readonly showMedia = input(true);
  readonly showAvailability = input(true);
  readonly showCta = input(true);
  readonly availabilityLabel = input('Disponibilidad');
  readonly playersLabel = input('jugadores');
  readonly clockIcon = input('pi pi-clock');
  readonly locationIcon = input('pi pi-map-marker');
  readonly join = output<MatchSummary>();

  protected readonly fillPercent = computed(() => {
    const { joinedPlayers, totalPlayers } = this.match();
    return totalPlayers > 0 ? Math.round((joinedPlayers / totalPlayers) * 100) : 0;
  });
}
