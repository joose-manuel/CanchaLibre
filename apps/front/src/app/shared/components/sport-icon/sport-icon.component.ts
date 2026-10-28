import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProfileSportKey } from '../../pages/profile/interfaces/profile.interface';

/**
 * Icono vectorial de deporte. Se usa en el perfil (deportes preferidos) y en
 * el historial de partidos.
 */
@Component({
  selector: 'cl-sport-icon',
  templateUrl: './sport-icon.component.html',
  styleUrl: './sport-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportIconComponent {
  readonly sport = input.required<ProfileSportKey>();
  readonly size = input(18);
}
