import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UserHeader } from '../../interfaces/user-header.interface';
import { UserService } from '../../pages/dashboard/services/user.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * Cabecera del dashboard: saludo, toggle de tema y acceso al perfil.
 */
@Component({
  selector: 'cl-dashboard-header',
  imports: [ThemeToggleComponent],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent {
  private readonly userService = inject(UserService);

  readonly user = computed<UserHeader>(() => {
    const profile = this.userService.getCurrentUser();

    return {
      eyebrow: 'Bienvenido',
      firstName: profile.firstName,
      avatarSrc: profile.avatarSrc,
      online: profile.online,
      emoji: ' 👋',
    };
  });

  readonly greeting = input('Hola');
  readonly avatarPressed = output<void>();
}
