import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CourtOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';
import { SportIconComponent } from '../sport-icon/sport-icon.component';

/**
 * Tarjeta de una cancha seleccionable (paso 1 del asistente).
 *
 * Muestra la portada, el nombre, la ubicación, los deportes disponibles, la
 * distancia y el precio por hora.
 */
@Component({
  selector: 'cl-court-option',
  imports: [SportIconComponent],
  templateUrl: './court-option.component.html',
  styleUrl: './court-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOptionComponent {
  readonly court = input.required<CourtOption>();
  readonly selected = input(false);
  readonly selectedChange = output<CourtOption>();
}
