import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TimeSlotOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Selector de franja horaria (paso 2 del asistente).
 *
 * Las franjas no disponibles se muestran deshabilitadas: es mejor que el
 * usuario vea qué hay antes de que se pregunte por qué falta una hora.
 */
@Component({
  selector: 'cl-time-slots',
  templateUrl: './time-slots.component.html',
  styleUrl: './time-slots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSlotsComponent {
  readonly slots = input.required<TimeSlotOption[]>();
  readonly selected = input('');
  readonly selectedChange = output<string>();
}
