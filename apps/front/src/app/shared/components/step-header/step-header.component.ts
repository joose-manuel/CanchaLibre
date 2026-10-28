import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Cabecera del asistente "Crear Partido".
 *
 * Muestra el título, el paso actual ("PASO 2 DE 4") y una barra de progreso.
 * Es reutilizable por cualquier flujo por pasos.
 */
@Component({
  selector: 'cl-step-header',
  templateUrl: './step-header.component.html',
  styleUrl: './step-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepHeaderComponent {
  readonly title = input.required<string>();
  readonly step = input.required<number>();
  readonly totalSteps = input.required<number>();
  /** Muestra el botón de volver. */
  readonly backVisible = input(true);
  /** Muestra el título y el número de paso. */
  readonly titleVisible = input(true);
  readonly back = output<void>();

  /** Porcentaje de avance (0 - 100). */
  protected readonly progress = computed(() =>
    Math.min(100, Math.round((this.step() / this.totalSteps()) * 100)),
  );

  /** "PASO 2 DE 4" */
  protected readonly stepLabel = computed(
    () => `PASO ${this.step()} DE ${this.totalSteps()}`,
  );
}
