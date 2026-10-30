import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Un destino del submenú. */
export interface SubnavItem {
  value: string;
  label: string;
  /** Icono de PrimeIcons (opcional). */
  icon?: string;
}

/**
 * Submenú de una sección.
 *
 * Permite navegar entre apartados relacionados sin perder el contexto de
 * la sección (agenda, reservas, disponibilidad, pagos del propietario).
 */
@Component({
  selector: 'cl-subnav',
  templateUrl: './subnav.component.html',
  styleUrl: './subnav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubnavComponent {
  readonly items = input.required<SubnavItem[]>();
  readonly active = input.required<string>();
  readonly selectedChange = output<string>();
}
