import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Deportes con icono vectorial propio. */
export type SportIconKey =
  | 'futbol'
  | 'padel'
  | 'basket'
  | 'tenis'
  | 'voley'
  | 'gimnasio';

/**
 * Icono vectorial de deporte.
 *
 * Se usa en el perfil (deportes preferidos), en el historial de partidos y
 * en los chips de deportes del registro de sede.
 */
@Component({
  selector: 'cl-sport-icon',
  templateUrl: './sport-icon.component.html',
  styleUrl: './sport-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportIconComponent {
  readonly sport = input.required<SportIconKey>();
  readonly size = input(18);
}
