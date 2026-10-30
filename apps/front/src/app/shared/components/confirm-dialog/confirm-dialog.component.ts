import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';

/** Clase que bloquea el scroll del fondo mientras hay un diálogo abierto. */
const DIALOG_OPEN_CLASS = 'cl-dialog-open';

/**
 * Diálogo de confirmación modal.
 *
 * Se usa para pedir una decisión antes de una acción que cambia el contexto
 * de la sesión (por ejemplo, entrar al modo canchas).
 */
@Component({
  selector: 'cl-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly message = input.required<string>();
  /** Icono de PrimeIcons dentro del círculo. */
  readonly icon = input('pi pi-check');
  readonly primaryLabel = input('Sí, continuar');
  readonly secondaryLabel = input('Aún no');
  readonly closing = input(false);

  /**
   * El usuario acepta.
   *
   * No se llama `confirm` porque ese nombre choca con el evento `confirm`
   * del DOM.
   */
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  constructor() {
    // El fondo no debe desplazarse mientras el diálogo está abierto.
    document.body.classList.add(DIALOG_OPEN_CLASS);

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove(DIALOG_OPEN_CLASS);
    });
  }
}
