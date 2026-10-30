import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SpaceDraft } from '../../pages/registrar-cancha/interfaces/registrar-cancha.interface';

/**
 * Fila de un espacio añadido en el paso 2 del asistente.
 */
@Component({
  selector: 'cl-space-row',
  templateUrl: './space-row.component.html',
  styleUrl: './space-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceRowComponent {
  readonly space = input.required<SpaceDraft>();

  readonly edit = output<SpaceDraft>();
  readonly remove = output<SpaceDraft>();
}
