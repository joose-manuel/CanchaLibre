import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourtOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Ticket de la reserva (paso 4 del asistente).
 *
 * Resume los datos que el usuario necesita el día del partido: dónde, cuándo
 * y cuánto pagó por adelantado.
 */
@Component({
  selector: 'cl-booking-ticket',
  templateUrl: './booking-ticket.component.html',
  styleUrl: './booking-ticket.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingTicketComponent {
  readonly court = input.required<CourtOption>();
  /** "jueves, 29 de octubre" */
  readonly dateLabel = input.required<string>();
  /** "4:00 PM - 5:00 PM" */
  readonly timeLabel = input.required<string>();
  /** "5 v 5" */
  readonly formatLabel = input.required<string>();
  /** "$120.000 COP" */
  readonly totalLabel = input.required<string>();
  /** "$36.000 COP" */
  readonly depositLabel = input.required<string>();
  /** "$84.000 COP" */
  readonly remainingLabel = input.required<string>();
  readonly depositPercent = input(30);
}
