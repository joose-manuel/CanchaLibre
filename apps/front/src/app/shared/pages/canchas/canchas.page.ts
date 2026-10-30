import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { VenueCardComponent } from '../../components/venue-card/venue-card.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
import { MediaQueryService } from '../../services/media-query.service';
import { OwnedVenueView } from '../registrar-cancha/interfaces/registrar-cancha.interface';
import { RegistrarCanchaService } from '../registrar-cancha/services/registrar-cancha.service';

/**
 * "Mis Canchas": listado de las sedes del usuario en modo propietario.
 *
 * Desde aquí se puede crear una sede nueva (el botón "+") o entrar a
 * editar / administrar las existentes.
 */
@Component({
  selector: 'cl-canchas-page',
  imports: [AppMenuComponent, VenueCardComponent],
  templateUrl: './canchas.page.html',
  styleUrl: './canchas.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanchasPage {
  private readonly registrarCanchaService = inject(RegistrarCanchaService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly venues = signal<OwnedVenueView[]>([]);
  protected readonly loading = signal(true);

  /** `true` si el usuario todavía no tiene ninguna sede. */
  protected readonly isEmpty = computed(() => !this.loading() && this.venues().length === 0);

  constructor() {
    this.registrarCanchaService.getMyVenues().subscribe((venues) => {
      this.venues.set(venues);
      this.loading.set(false);
    });
  }

  /** Crea una sede nueva: abre el asistente en el paso 1. */
  protected onCreate(): void {
    void this.router.navigate(['/registrar-cancha'], {
      queryParams: { paso: 1 },
    });
  }

  /** Edita una sede: abre el asistente con sus datos. */
  protected onEdit(venue: OwnedVenueView): void {
    void this.router.navigate(['/registrar-cancha'], {
      queryParams: { sede: venue.id },
    });
  }

  /** Administra los espacios de una sede: abre el paso 2 del asistente. */
  protected onManage(venue: OwnedVenueView): void {
    void this.router.navigate(['/registrar-cancha'], {
      queryParams: { sede: venue.id, paso: 2 },
    });
  }
}
