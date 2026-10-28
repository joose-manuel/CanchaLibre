import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormatOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Tarjeta de formato de juego (paso 2 del asistente): 5v5, 7v7, etc.
 */
@Component({
  selector: 'cl-format-option',
  templateUrl: './format-option.component.html',
  styleUrl: './format-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormatOptionComponent {
  readonly format = input.required<FormatOption>();
  readonly selected = input(false);
  readonly selectedChange = output<FormatOption>();
}
