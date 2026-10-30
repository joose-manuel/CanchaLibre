import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Cabecera del asistente de registro de sede.
 *
 * Muestra el paso actual, el título del paso y el porcentaje completado.
 */
@Component({
  selector: 'cl-wizard-header',
  templateUrl: './wizard-header.component.html',
  styleUrl: './wizard-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardHeaderComponent {
  readonly step = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly title = input.required<string>();
  /** Porcentaje completado (0 - 100). */
  readonly percent = input.required<number>();

  readonly back = output<void>();

  /** "PASO 1 DE 3" */
  protected readonly stepLabel = computed(
    () => `PASO ${this.step()} DE ${this.totalSteps()}`,
  );

  /** "35% completado" */
  protected readonly percentLabel = computed(() => `${this.percent()}% completado`);
}
