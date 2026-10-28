import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProfileUser } from '../../pages/profile/interfaces/profile.interface';
import { SportIconComponent } from '../sport-icon/sport-icon.component';

/**
 * Cabecera del perfil: avatar, nombre, ciudad y tarjetas de nivel/deportes.
 */
@Component({
  selector: 'cl-profile-summary',
  imports: [SportIconComponent],
  templateUrl: './profile-summary.component.html',
  styleUrl: './profile-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSummaryComponent {
  readonly user = input.required<ProfileUser>();
  readonly edit = output<void>();
}
