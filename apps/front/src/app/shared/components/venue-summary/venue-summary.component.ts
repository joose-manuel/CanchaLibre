import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourtOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Resumen de la cancha elegida (paso 2 del asistente).
 *
 * Muestra la portada, el nombre del espacio y la dirección: el recordatorio
 * de qué se está reservando mientras se configura el partido.
 */
@Component({
  selector: 'cl-venue-summary',
  templateUrl: './venue-summary.component.html',
  styleUrl: './venue-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueSummaryComponent {
  readonly court = input.required<CourtOption>();
}
