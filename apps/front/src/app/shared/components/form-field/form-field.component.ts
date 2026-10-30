import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Campo de formulario con etiqueta e icono.
 *
 * El control real (input, select, etc.) se proyecta con `ng-content`, así
 * el mismo campo sirve para texto, número o desplegable.
 */
@Component({
  selector: 'cl-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  /** Icono de PrimeIcons (opcional). */
  readonly icon = input('');
  /** Texto auxiliar bajo el control. */
  readonly hint = input('');
}
