import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Franja informativa con icono (fecha, sede, avisos).
 *
 * Se usa en el resumen del partido y en la confirmación del pago.
 */
@Component({
  selector: 'cl-info-row',
  templateUrl: './info-row.component.html',
  styleUrl: './info-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoRowComponent {
  readonly icon = input('pi pi-calendar');
  readonly title = input('');
  readonly subtitle = input('');
  readonly tone = input<'default' | 'primary' | 'success'>('default');
}
