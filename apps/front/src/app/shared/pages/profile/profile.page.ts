import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { MatchHistoryItemComponent } from '../../components/match-history-item/match-history-item.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';
import { ProfileSummaryComponent } from '../../components/profile-summary/profile-summary.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
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

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly user = signal<ProfileUser>(FALLBACK_USER);
  protected readonly history = signal<MatchHistoryEntry[]>(FALLBACK_HISTORY);
  protected readonly settings = signal<ProfileSettingSection[]>([]);
  protected readonly ownerModePending = signal(false);

  protected readonly ownerButtonLabel = computed(() =>
    this.user().isOwner ? 'Volver a Modo Jugador' : 'Cambiar a Modo Propietario',
  );

  protected readonly ownerButtonHint = computed(() =>
    this.user().isOwner
      ? 'Vuelve a la experiencia de jugador'
      : 'Gestiona tus canchas y reservas',
  );

  constructor() {
    this.profileService.getProfile().subscribe((user) => this.user.set(user));
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

  protected switchOwnerMode(): void {
    if (this.ownerModePending()) {
      return;
    }

    this.ownerModePending.set(true);

    this.profileService.becomeOwner().subscribe((user: ProfileUser) => {
      this.user.set(user);
      this.ownerModePending.set(false);
    });
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
