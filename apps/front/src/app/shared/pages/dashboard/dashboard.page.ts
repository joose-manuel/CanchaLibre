import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { FilterChipsComponent } from '../../components/filter-chips/filter-chips.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { MatchDetailComponent } from '../../components/match-detail/match-detail.component';
import { PromoBannerComponent } from '../../components/promo-banner/promo-banner.component';
import { SearchFieldComponent } from '../../components/search-field/search-field.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { FilterOption } from '../../interfaces/filter-option.interface';
import { MatchSummary } from '../../interfaces/match-summary.interface';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
import { MatchesService } from './services/matches.service';
import { MediaQueryService } from '../../services/media-query.service';

const ALL_SPORTS = 'todos';

@Component({
  selector: 'cl-dashboard-page',
  imports: [
    AppMenuComponent,
    DashboardHeaderComponent,
    FilterChipsComponent,
    MatchCardComponent,
    MatchDetailComponent,
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
  private readonly router = inject(Router);

  protected readonly sportFilters: FilterOption[] = [
    { value: ALL_SPORTS, label: 'Todos' },
    { value: 'futbol', label: 'Fútbol' },
    { value: 'padel', label: 'Pádel' },
    { value: 'basket', label: 'Basket' },
  ];

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly activeSport = signal(ALL_SPORTS);
  protected readonly searchTerm = signal('');
  protected readonly activeNav = signal('inicio');
  protected readonly selectedMatch = signal<MatchSummary | null>(null);
  protected readonly detailClosing = signal(false);

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

  protected openMatchDetail(match: MatchSummary): void {
    this.detailClosing.set(false);
    this.selectedMatch.set(match);
  }

  /** El avatar del header lleva a la página de perfil. */
  protected goToProfile(): void {
    void this.router.navigateByUrl('/perfil');
  }

  /** El FAB "Crear" abre el asistente de creación de partido. */
  protected goToCreateMatch(): void {
    void this.router.navigateByUrl('/crear-partido');
  }

  protected closeMatchDetail(): void {
    if (this.detailClosing()) {
      return;
    }

    this.detailClosing.set(true);
    setTimeout(() => {
      this.selectedMatch.set(null);
      this.detailClosing.set(false);
    }, 220);
  }
}
