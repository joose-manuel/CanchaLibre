import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BookingSegment } from '../../pages/reservas/interfaces/reservas.interface';

/**
 * Control segmentado (Próximas / Anteriores) con indicador deslizante.
 */
@Component({
  selector: 'cl-booking-segments',
  templateUrl: './booking-segments.component.html',
  styleUrl: './booking-segments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingSegmentsComponent {
  readonly segments = input.required<BookingSegment[]>();
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();
}
