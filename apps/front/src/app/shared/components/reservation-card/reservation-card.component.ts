import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AdminReservation } from '../../interfaces/owner.interface';

/**
 * Tarjeta de una reserva en la lista del propietario.
 */
@Component({
  selector: 'cl-reservation-card',
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCardComponent {
  readonly reservation = input.required<AdminReservation>();

  readonly open = output<AdminReservation>();
}
