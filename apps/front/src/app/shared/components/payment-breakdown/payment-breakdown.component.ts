import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PriceLine } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Desglose de pago del resumen (paso 3 del asistente).
 */
@Component({
  selector: 'cl-payment-breakdown',
  templateUrl: './payment-breakdown.component.html',
  styleUrl: './payment-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentBreakdownComponent {
  readonly lines = input.required<PriceLine[]>();
  /** "Total a Pagar Hoy" */
  readonly totalLabel = input('Total a Pagar Hoy');
  /** "$12.250 COP" */
  readonly total = input.required<string>();
}
