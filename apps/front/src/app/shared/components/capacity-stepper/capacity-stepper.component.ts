import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Control numérico de capacidad (paso 2 del asistente).
 *
 * Es un stepper clásico (menos / valor / más) porque el rango es corto y
 * el usuario quiere ir de 10 a 12, no escribir el número.
 */
@Component({
  selector: 'cl-capacity-stepper',
  templateUrl: './capacity-stepper.component.html',
  styleUrl: './capacity-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityStepperComponent {
  readonly value = input.required<number>();
  readonly min = input(2);
  readonly max = input(22);
  /** Valor recomendado (se muestra como etiqueta). */
  readonly recommended = input<number | null>(null);
  readonly valueChange = output<number>();

  protected decrement(): void {
    if (this.value() > this.min()) {
      this.valueChange.emit(this.value() - 1);
    }
  }

  protected increment(): void {
    if (this.value() < this.max()) {
      this.valueChange.emit(this.value() + 1);
    }
  }
}
