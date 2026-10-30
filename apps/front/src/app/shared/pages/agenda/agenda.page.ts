import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaEntryComponent } from '../../components/agenda-entry/agenda-entry.component';
import { AgendaStatsComponent } from '../../components/agenda-stats/agenda-stats.component';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { BookingSegmentsComponent } from '../../components/booking-segments/booking-segments.component';
import { SubnavComponent } from '../../components/subnav/subnav.component';
import { OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { AgendaEntry } from '../../interfaces/owner.interface';
import { MediaQueryService } from '../../services/media-query.service';
import {
  AGENDA_DAY_TABS,
  BLOCK_SLOT_LABEL,
  SCHEDULE_TITLE,
} from './constants/agenda.constants';
import { AgendaService } from './services/agenda.service';

/**
 * Agenda del propietario.
 *
 * Es el punto de entrada de la sección: desde aquí se llega a las reservas,
 * la disponibilidad y los pagos (el submenú), y se ve el cronograma del día.
 */
@Component({
  selector: 'cl-agenda-page',
  imports: [
    AgendaEntryComponent,
    AgendaStatsComponent,
    AppMenuComponent,
    BookingSegmentsComponent,
    SubnavComponent,
  ],
  templateUrl: './agenda.page.html',
  styleUrl: './agenda.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPage {
  private readonly agendaService = inject(AgendaService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems = OWNER_NAV_ITEMS;

  protected readonly dayTabs = AGENDA_DAY_TABS;
  protected readonly scheduleTitle = SCHEDULE_TITLE;
  protected readonly blockSlotLabel = BLOCK_SLOT_LABEL;

  /** Apartados de la sección de propietario. */
  protected readonly subnavItems = [
    { value: 'agenda', label: 'Agenda', icon: 'pi pi-calendar' },
    { value: 'reservas', label: 'Reservas', icon: 'pi pi-list' },
    { value: 'disponibilidad', label: 'Disponibilidad', icon: 'pi pi-th-large' },
    { value: 'pagos', label: 'Pagos', icon: 'pi pi-wallet' },
  ];

  protected readonly activeSection = signal('agenda');

  /** Día seleccionado ("today" / "tomorrow" / "calendar"). */
  protected readonly selectedDay = signal('today');

  protected readonly entries = signal<AgendaEntry[]>([]);

  protected readonly stats = computed(() => this.agendaService.getStats(this.entries()));

  constructor() {
    this.load();
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

  /** Cambia el día mostrado. */
  protected onDayChange(value: string): void {
    this.selectedDay.set(value);
    this.load();
  }

  protected onConfirm(entry: AgendaEntry): void {
    this.agendaService.confirm(entry.id).subscribe(() => {
      this.entries.update((entries) =>
        entries.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                status: 'confirmed',
                statusLabel: 'CONFIRMADA',
                statusNote: 'Pagado',
                actionable: false,
              }
            : item,
        ),
      );
    });
  }

  protected onReject(entry: AgendaEntry): void {
    this.agendaService.reject(entry.id).subscribe(() => {
      this.entries.update((entries) =>
        entries.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                status: 'cancelled',
                statusLabel: 'CANCELADA',
                statusNote: 'Cancelada',
                actionable: false,
              }
            : item,
        ),
      );
    });
  }

  /** Abre el detalle de la reserva. */
  protected onOpen(entry: AgendaEntry): void {
    void this.router.navigate(['/agenda/reservas/detalle'], {
      queryParams: { reserva: entry.id },
    });
  }

  /** Carga el cronograma del día seleccionado. */
  private load(): void {
    this.agendaService.getSchedule(this.dateFor(this.selectedDay())).subscribe((entries) => {
      this.entries.set(entries);
    });
  }

  /** Fecha `yyyy-mm-dd` del día seleccionado. */
  private dateFor(day: string): string {
    const date = new Date();

    if (day === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNumber = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${dayNumber}`;
  }
}
