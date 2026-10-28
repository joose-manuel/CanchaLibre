import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { FilterChipsComponent } from '../../components/filter-chips/filter-chips.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { PromoBannerComponent } from '../../components/promo-banner/promo-banner.component';
import { SearchFieldComponent } from '../../components/search-field/search-field.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { FilterOption } from '../../interfaces/filter-option.interface';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { UserHeader } from '../../interfaces/user-header.interface';
import { MatchesService } from '../../services/matches.service';
import { MediaQueryService } from '../../services/media-query.service';

const ALL_SPORTS = 'todos';

@Component({
  selector: 'cl-dashboard-page',
  imports: [
    AppMenuComponent,
    DashboardHeaderComponent,
    FilterChipsComponent,
    MatchCardComponent,
    PromoBannerComponent,
    SearchFieldComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly matchesService = inject(MatchesService);
  private readonly mediaQuery = inject(MediaQueryService);

  protected readonly user: UserHeader = {
    eyebrow: 'Bienvenido',
    firstName: 'Carlos',
    avatarSrc: 'images/avatar-carlos.png',
    online: true,
    emoji: ' 👋',
  };

  protected readonly sportFilters: FilterOption[] = [
    { value: ALL_SPORTS, label: 'Todos' },
    { value: 'futbol', label: 'Fútbol' },
    { value: 'padel', label: 'Pádel' },
    { value: 'basket', label: 'Basket' },
  ];

  protected readonly navItems: MenuItem[] = [
    { key: 'inicio', label: 'Inicio', icon: 'pi pi-home' },
    { key: 'reservas', label: 'Reservas', icon: 'pi pi-calendar' },
    { key: 'mensajes', label: 'Mensajes', icon: 'pi pi-comments', badge: 3 },
    { key: 'perfil', label: 'Perfil', icon: 'pi pi-user' },
  ];

  protected readonly activeSport = signal(ALL_SPORTS);
  protected readonly searchTerm = signal('');
  protected readonly activeNav = signal('inicio');

  protected readonly isDesktop = this.mediaQuery.isDesktop;
  protected readonly menuVariant = computed(() =>
    this.isDesktop() ? 'sidebar' : 'bottom',
  );

  protected readonly matches = computed(() => {
    const sport = this.activeSport();
    const term = this.searchTerm().trim().toLowerCase();

    return this.matchesService.getTodayMatches().filter((match) => {
      const sportMatches = sport === ALL_SPORTS || match.sport === sport;
      const textMatches =
        term === '' || `${match.venue} ${match.address}`.toLowerCase().includes(term);
      return sportMatches && textMatches;
    });
  });
}
