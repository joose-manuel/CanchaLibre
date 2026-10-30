import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProfileMode } from '../../pages/cambiar-perfil/interfaces/cambiar-perfil.interface';

/**
 * Tarjeta de un modo de perfil (jugador / cancha).
 *
 * Se usa en el selector de modo: muestra el icono, el título, la insignia
 * de "Activo" cuando corresponde, la descripción, la portada y la acción.
 */
@Component({
  selector: 'cl-profile-mode-card',
  templateUrl: './profile-mode-card.component.html',
  styleUrl: './profile-mode-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileModeCardComponent {
  readonly mode = input.required<ProfileMode>();
  /** `true` si es el modo activo del usuario. */
  readonly active = input(false);
  readonly actionLabel = input.required<string>();
  /** `true` si la acción es secundaria (el modo ya está activo). */
  readonly secondary = input(false);
  readonly disabled = input(false);

  /**
   * El usuario pidió este modo.
   *
   * No se llama `select` porque ese nombre choca con el evento `select` del
   * DOM en los elementos de formulario.
   */
  readonly modeSelected = output<ProfileMode>();
}
