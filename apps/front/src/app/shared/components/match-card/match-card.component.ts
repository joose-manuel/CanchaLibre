import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatchSummary } from '../../interfaces/match-summary.interface';

/**
 * Card compacta de un partido (fila de la lista del dashboard).
 *
 * La portada es pequeña y la información va en columna: título, deporte con
 * su color, dirección y hora. La acción va a la derecha.
 */
@Component({
  selector: 'cl-match-card',
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent {
  readonly match = input.required<MatchSummary>();
  readonly ctaLabel = input('Unirme');
  readonly ctaDisabled = input(false);

  readonly join = output<MatchSummary>();

  /** "1,2 km" */
  protected readonly distanceLabel = computed(() => {
    const distance = this.match().distanceKm;

    if (distance === undefined) {
      return '';
    }

    return `${distance.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km`;
  });
}
