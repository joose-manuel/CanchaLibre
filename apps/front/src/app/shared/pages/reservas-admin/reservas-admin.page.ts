import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';
import { SearchFieldComponent } from '../../components/search-field/search-field.component';
import { SubnavComponent } from '../../components/subnav/subnav.component';
import { OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { AdminReservation } from '../../interfaces/owner.interface';
import { MediaQueryService } from '../../services/media-query.service';
import {
  HISTORY_LABEL,
  RECENT_RESERVATIONS_LABEL,
  RESERVATION_FILTERS,
  SEARCH_PLACEHOLDER,
} from './constants/reservas-admin.constants';
import { ReservasAdminService } from './services/reservas-admin.service';

/**
 * Lista de reservas del propietario.
 *
 * Es el segundo apartado de la sección de administración: el agenda del día
 * muestra lo urgente, aquí se busca cualquier reserva.
 */
@Component({
  selector: 'cl-reservas-admin-page',
  imports: [AppMenuComponent, ReservationCardComponent, SearchFieldComponent, SubnavComponent],
  templateUrl: './reservas-admin.page.html',
  styleUrl: './reservas-admin.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasAdminPage {
  private readonly reservasAdminService = inject(ReservasAdminService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems = OWNER_NAV_ITEMS;

  protected readonly filters = RESERVATION_FILTERS;
  protected readonly recentLabel = RECENT_RESERVATIONS_LABEL;
  protected readonly historyLabel = HISTORY_LABEL;
  protected readonly searchPlaceholder = SEARCH_PLACEHOLDER;

  protected readonly subnavItems = [
    { value: 'agenda', label: 'Agenda', icon: 'pi pi-calendar' },
    { value: 'reservas', label: 'Reservas', icon: 'pi pi-list' },
    { value: 'disponibilidad', label: 'Disponibilidad', icon: 'pi pi-th-large' },
    { value: 'pagos', label: 'Pagos', icon: 'pi pi-wallet' },
  ];

  protected readonly activeSection = signal('reservas');
  protected readonly activeFilter = signal('todas');
  protected readonly searchTerm = signal('');

  protected readonly reservations = signal<AdminReservation[]>([]);

  /** Reservas que pasan el filtro de estado y la búsqueda. */
  protected readonly visibleReservations = computed(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.reservations().filter((reservation) => {
      const matchesFilter =
        filter === 'todas' || reservation.statusTone === filter;

      const matchesSearch =
        term === '' ||
        `${reservation.customerName} ${reservation.codeLabel}`
          .toLowerCase()
          .includes(term);

      return matchesFilter && matchesSearch;
    });
  });

  constructor() {
    this.reservasAdminService
      .getReservations()
      .subscribe((reservations) => this.reservations.set(reservations));
  }

  protected onSectionChange(value: string): void {
    this.activeSection.set(value);

    const routes: Record<string, string> = {
      agenda: '/agenda',
      reservas: '/agenda/reservas',
      disponibilidad: '/agenda/disponibilidad',
      pagos: '/agenda/pagos',
    };

    void this.router.navigateByUrl(routes[value] ?? '/agenda');
  }

  protected onFilterChange(value: string): void {
    this.activeFilter.set(value);
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  /** Abre el detalle de la reserva. */
  protected onOpen(reservation: AdminReservation): void {
    void this.router.navigate(['/agenda/reservas/detalle'], {
      queryParams: { reserva: reservation.id },
    });
  }
}
