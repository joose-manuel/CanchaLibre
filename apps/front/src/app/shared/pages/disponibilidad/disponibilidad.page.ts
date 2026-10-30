import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { SubnavComponent } from '../../components/subnav/subnav.component';
import { OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { AvailabilityDay } from '../../interfaces/owner.interface';
import { MediaQueryService } from '../../services/media-query.service';
import {
  BLOCK_RANGE_LABEL,
  FALLBACK_OCCUPANCY,
  PAGE_TITLE,
} from './constants/disponibilidad.constants';
import { DisponibilidadService } from './services/disponibilidad.service';

/**
 * Gestión de disponibilidad y bloqueos.
 *
 * Muestra la semana de un espacio: qué huecos están libres, qué están
 * reservados y qué bloqueó el administrador.
 */
@Component({
  selector: 'cl-disponibilidad-page',
  imports: [AppMenuComponent, SubnavComponent],
  templateUrl: './disponibilidad.page.html',
  styleUrl: './disponibilidad.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisponibilidadPage {
  private readonly disponibilidadService = inject(DisponibilidadService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems = OWNER_NAV_ITEMS;

  protected readonly pageTitle = PAGE_TITLE;
  protected readonly blockRangeLabel = BLOCK_RANGE_LABEL;

  protected readonly subnavItems = [
    { value: 'agenda', label: 'Agenda', icon: 'pi pi-calendar' },
    { value: 'reservas', label: 'Reservas', icon: 'pi pi-list' },
    { value: 'disponibilidad', label: 'Disponibilidad', icon: 'pi pi-th-large' },
    { value: 'pagos', label: 'Pagos', icon: 'pi pi-wallet' },
  ];

  protected readonly activeSection = signal('disponibilidad');

  /** Espacios del propietario. */
  protected readonly spaces = signal<{ id: string; name: string }[]>([]);
  protected readonly selectedSpace = signal('');

  /** Grilla de la semana. */
  protected readonly days = signal<AvailabilityDay[]>([]);

  /** Porcentaje de ocupación de la semana. */
  protected readonly occupancy = computed(() => {
    const columns = this.days();

    if (columns.length === 0) {
      return FALLBACK_OCCUPANCY;
    }

    const slots = columns.flatMap((day) => day.slots);
    const occupied = slots.filter((slot) => slot.entry !== null).length;

    return slots.length === 0 ? 0 : Math.round((occupied / slots.length) * 100);
  });

  /** Franjas de la grilla (columnas = días, filas = horas). */
  protected readonly timeRows = computed(() => {
    const first = this.days()[0];

    return first ? first.slots.map((slot) => slot.time) : [];
  });

  constructor() {
    this.disponibilidadService.getSpaces().subscribe((spaces) => {
      this.spaces.set(spaces);

      const first = spaces[0];

      if (first) {
        this.selectedSpace.set(first.id);
        this.loadWeek(first.id);
      }
    });
  }

  /** Cambia de apartado de la sección. */
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

  /** Cambia el espacio mostrado. */
  protected onSpaceChange(value: string): void {
    this.selectedSpace.set(value);
    this.loadWeek(value);
  }

  /** Bloquea un rango de la semana. */
  protected onBlockRange(): void {
    const spaceId = this.selectedSpace();

    if (!spaceId) {
      return;
    }

    const start = new Date();
    start.setHours(8, 0, 0, 0);

    const end = new Date();
    end.setHours(12, 0, 0, 0);

    this.disponibilidadService.blockRange(spaceId, start.toISOString(), end.toISOString()).subscribe(() => {
      this.loadWeek(spaceId);
    });
  }

  /** Carga la semana del espacio elegido. */
  private loadWeek(spaceId: string): void {
    this.disponibilidadService.getWeek(spaceId).subscribe((days) => this.days.set(days));
  }
}
