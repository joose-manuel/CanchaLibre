import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BookingDay } from '../../pages/reservas/interfaces/reservas.interface';

/**
 * Selector horizontal de días. Desplazable en móvil, con el día activo
 * resaltado.
 */
@Component({
  selector: 'cl-booking-day-picker',
  templateUrl: './booking-day-picker.component.html',
  styleUrl: './booking-day-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDayPickerComponent {
  readonly days = input.required<BookingDay[]>();
  readonly selected = output<string>();
}
