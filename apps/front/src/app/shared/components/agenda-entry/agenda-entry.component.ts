import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AgendaEntry } from '../../interfaces/owner.interface';

/**
 * Fila del cronograma del día (agenda del propietario).
 *
 * Muestra la hora, la cancha, quien reservó y el estado. Si la reserva está
 * pendiente ofrece las acciones de confirmar y rechazar.
 */
@Component({
  selector: 'cl-agenda-entry',
  templateUrl: './agenda-entry.component.html',
  styleUrl: './agenda-entry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaEntryComponent {
  readonly entry = input.required<AgendaEntry>();

  readonly confirm = output<AgendaEntry>();
  readonly reject = output<AgendaEntry>();
  readonly open = output<AgendaEntry>();
}
