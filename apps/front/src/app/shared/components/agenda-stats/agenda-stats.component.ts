import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AgendaStats } from '../../interfaces/owner.interface';
import { toCompactCop } from '../../pages/agenda/constants/agenda.constants';

/**
 * Métricas de la cabecera de la agenda: reservas, anticipos y bloqueos.
 */
@Component({
  selector: 'cl-agenda-stats',
  templateUrl: './agenda-stats.component.html',
  styleUrl: './agenda-stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaStatsComponent {
  readonly stats = input.required<AgendaStats>();

  /** Anticipos en formato compacto: "$150k". */
  protected readonly depositsLabel = computed(() => toCompactCop(this.stats().deposits));
}
