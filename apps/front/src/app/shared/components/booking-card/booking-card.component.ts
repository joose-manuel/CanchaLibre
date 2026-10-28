import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BookingView } from '../../pages/reservas/interfaces/reservas.interface';

/**
 * Card de una reserva: portada, sede, estado, fecha, acción de gestión,
 * participantes y desglose de pago.
 */
@Component({
  selector: 'cl-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCardComponent {
  readonly booking = input.required<BookingView>();
  readonly manage = output<BookingView>();
  readonly share = output<BookingView>();
}
