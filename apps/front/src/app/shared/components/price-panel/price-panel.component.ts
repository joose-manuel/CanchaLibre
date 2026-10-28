import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PriceLine } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Panel de precio (paso 2 del asistente).
 *
 * Es un bloque oscuro: el precio es el dato más importante de la pantalla y
 * el contraste invertido lo destaca sin necesidad de más color.
 */
@Component({
  selector: 'cl-price-panel',
  templateUrl: './price-panel.component.html',
  styleUrl: './price-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePanelComponent {
  readonly lines = input.required<PriceLine[]>();
  /** "PRECIO CALCULADO POR JUGADOR" */
  readonly caption = input('');
  /** "$12.000 COP" */
  readonly total = input.required<string>();
  readonly actionLabel = input('Continuar');
  readonly action = output<void>();
}
