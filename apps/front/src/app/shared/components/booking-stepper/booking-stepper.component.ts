import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Stepper de estados de una reserva: creada, pagada, confirmada.
 */
@Component({
  selector: 'cl-booking-stepper',
  templateUrl: './booking-stepper.component.html',
  styleUrl: './booking-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingStepperComponent {
  readonly steps = input.required<{ key: string; label: string; done: boolean }[]>();
}
