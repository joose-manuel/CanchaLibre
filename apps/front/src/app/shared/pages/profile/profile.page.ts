import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '@canchalibre/shared-domain';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatchHistoryItemComponent } from '../../components/match-history-item/match-history-item.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';
import { ProfileSummaryComponent } from '../../components/profile-summary/profile-summary.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS, OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { SessionService } from '../../services/session.service';
import { ThemeService } from '../../services/theme.service';
import { MediaQueryService } from '../../services/media-query.service';
import { FALLBACK_HISTORY, FALLBACK_USER } from './constants/profile.constants';
import {
  MatchHistoryEntry,
  ProfileSettingItem,
  ProfileSettingSection,
  ProfileUser,
} from './interfaces/profile.interface';
import { ProfileService } from './services/profile.service';

/** Clave del ajuste que controla el modo oscuro. */
const DARK_MODE_SETTING_KEY = 'dark-mode';

@Component({
  selector: 'cl-profile-page',
  imports: [
    AppMenuComponent,
    ConfirmDialogComponent,
    MatchHistoryItemComponent,
    ProfileSettingsComponent,
    ProfileSummaryComponent,
    SectionHeaderComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly profileService = inject(ProfileService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly session = inject(SessionService);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  /**
   * Navegación según el modo.
   *
   * En modo propietario el menú cambia a los destinos de gestión (agenda,
   * canchas); en modo jugador son los de siempre.
   */
  protected readonly navItems = computed<MenuItem[]>(() =>
    this.session.isOwner() ? OWNER_NAV_ITEMS : MAIN_NAV_ITEMS,
  );

  protected readonly user = signal<ProfileUser>(FALLBACK_USER);
  protected readonly history = signal<MatchHistoryEntry[]>(FALLBACK_HISTORY);
  protected readonly settings = signal<ProfileSettingSection[]>([]);
  protected readonly ownerModePending = signal(false);

  /** Diálogo de "¿Administras una cancha?" abierto. */
  protected readonly venueDialogOpen = signal(false);
  protected readonly venueDialogClosing = signal(false);

  protected readonly ownerButtonLabel = computed(() =>
    this.user().isOwner ? 'Volver a Modo Jugador' : 'Cambiar a Modo Propietario',
  );

  protected readonly ownerButtonHint = computed(() =>
    this.user().isOwner
      ? 'Vuelve a la experiencia de jugador'
      : 'Gestiona tus canchas y reservas',
  );

  constructor() {
    this.profileService.getProfile().subscribe((user) => {
      this.user.set(user);
      // El rol alimenta la insignia "Activo" de la pantalla "Cambiar Perfil".
      this.session.setRole(user.isOwner ? UserRole.Owner : UserRole.Player);
    });
    this.profileService.getMatchHistory().subscribe((history) => this.history.set(history));
    this.profileService.getSettings().subscribe((settings) => {
      // El interruptor de modo oscuro refleja el estado real del tema.
      this.settings.set(
        settings.map((section) => ({
          ...section,
          items: section.items.map((item) =>
            item.key === DARK_MODE_SETTING_KEY
              ? { ...item, value: this.theme.isDark() }
              : item,
          ),
        })),
      );
    });
  }

  /**
   * El botón lleva a la pantalla "Cambiar Perfil".
   *
   * Ahí se muestran los dos modos y el que está activo, y desde ahí se
   * decide a cuál cambiar.
   */
  protected switchOwnerMode(): void {
    void this.router.navigateByUrl('/cambiar-perfil');
  }

  /**
   * "Registrar cancha" pide la confirmación antes de entrar.
   *
   * La gestión de canchas solo tiene sentido para propietarios o gestores,
   * así que se pregunta antes de llevar al usuario a esa sección.
   */
  protected onRegisterVenue(): void {
    if (this.venueDialogOpen()) {
      return;
    }

    this.venueDialogClosing.set(false);
    this.venueDialogOpen.set(true);
  }

  /** Confirma: entra al modo canchas y abre la lista de sedes. */
  protected onConfirmVenue(): void {
    this.session.setRole(UserRole.Owner);
    this.closeVenueDialog();
    void this.router.navigateByUrl('/canchas');
  }

  /** Cancela: se queda en el perfil. */
  protected onCancelVenue(): void {
    this.closeVenueDialog();
  }

  /** Cierra el diálogo con la animación de salida. */
  private closeVenueDialog(): void {
    if (this.venueDialogClosing()) {
      return;
    }

    this.venueDialogClosing.set(true);
    setTimeout(() => {
      this.venueDialogOpen.set(false);
      this.venueDialogClosing.set(false);
    }, 220);
  }

  protected onToggleSetting(event: { key: string; value: boolean }): void {
    if (event.key === DARK_MODE_SETTING_KEY) {
      this.theme.setMode(event.value ? 'dark' : 'light');
      return;
    }

    this.settings.update((sections) =>
      sections.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.key === event.key ? { ...item, value: event.value } : item,
        ),
      })),
    );
  }

  protected onSettingAction(item: ProfileSettingItem): void {
    if (item.key === 'logout') {
      void this.router.navigateByUrl('/login');
    }
  }
}
