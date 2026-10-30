import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SportIconKey, SportIconComponent } from '../sport-icon/sport-icon.component';

/** Una opción de los chips seleccionables (deportes, tipos, etc.). */
export interface ChipOption {
  value: string;
  label: string;
  /** Icono de PrimeIcons (opcional). */
  icon?: string;
  /** Icono vectorial de deporte (tiene prioridad sobre `icon`). */
  sportKey?: SportIconKey;
}

/**
 * Grupo de chips de selección múltiple.
 *
 * Sirve para los deportes de la sede y los deportes permitidos de un
 * espacio: se pueden elegir varios a la vez.
 */
@Component({
  selector: 'cl-chip-select',
  imports: [SportIconComponent],
  templateUrl: './chip-select.component.html',
  styleUrl: './chip-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSelectComponent {
  readonly options = input.required<ChipOption[]>();
  /** Valores seleccionados. */
  readonly selected = input.required<string[]>();
  readonly multiple = input(true);

  readonly selectionChange = output<string[]>();

  /**
   * Alterna un valor.
   *
   * En modo múltiple se agrega o quita; en modo único se reemplaza la
   * selección completa.
   */
  protected toggle(value: string): void {
    const current = this.selected();

    if (!this.multiple()) {
      this.selectionChange.emit(current[0] === value ? [] : [value]);
      return;
    }

    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    this.selectionChange.emit(next);
  }
}
