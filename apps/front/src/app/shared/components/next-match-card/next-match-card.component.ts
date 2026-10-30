import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatchSummary } from '../../interfaces/match-summary.interface';

/**
 * Card protagonista del dashboard: el partido que empieza pronto.
 *
 * A diferencia de las cards de la lista, esta lleva la portada grande con
 * la cuenta regresiva, la barra de ocupación y la acción de unirse.
 */
@Component({
  selector: 'cl-next-match-card',
  templateUrl: './next-match-card.component.html',
  styleUrl: './next-match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextMatchCardComponent {
  readonly match = input.required<MatchSummary>();
  readonly ctaLabel = input('Unirme');
  readonly ctaDisabled = input(false);

  readonly join = output<MatchSummary>();

  /** Porcentaje de cupos ocupados. */
  protected readonly fillPercent = computed(() => {
    const { joinedPlayers, totalPlayers } = this.match();

    return totalPlayers > 0 ? Math.round((joinedPlayers / totalPlayers) * 100) : 0;
  });

  /** Jugadores que todavía faltan. */
  protected readonly missingPlayers = computed(
    () => Math.max(0, this.match().totalPlayers - this.match().joinedPlayers),
  );

  /** "2h 56 min" */
  protected readonly countdownLabel = computed(() => {
    const minutes = this.match().startsInMinutes;

    if (minutes === undefined || minutes < 0) {
      return '';
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
      return `${rest} min`;
    }

    return `${hours}h ${rest} min`;
  });

  /** "1,2 km" */
  protected readonly distanceLabel = computed(() => {
    const distance = this.match().distanceKm;

    if (distance === undefined) {
      return '';
    }

    return `${distance.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km`;
  });
}
