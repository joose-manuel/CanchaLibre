import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { BookingDayPickerComponent } from '../../components/booking-day-picker/booking-day-picker.component';
import { BookingSegmentsComponent } from '../../components/booking-segments/booking-segments.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
import { MediaQueryService } from '../../services/media-query.service';
import { FALLBACK_BOOKINGS } from './constants/reservas.constants';
import {
  BookingDay,
  BookingSegment,
  BookingSegmentValue,
  BookingView,
} from './interfaces/reservas.interface';
import { ReservasService } from './services/reservas.service';

/** Días que muestra el selector horizontal. */
const DAYS_WINDOW = 7;

@Component({
  selector: 'cl-reservas-page',
  imports: [
    AppMenuComponent,
    BookingCardComponent,
    BookingDayPickerComponent,
    BookingSegmentsComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './reservas.page.html',
  styleUrl: './reservas.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasPage {
  private readonly reservasService = inject(ReservasService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly bookings = signal<BookingView[]>(FALLBACK_BOOKINGS);
  protected readonly segments = signal<BookingSegment[]>([]);
  protected readonly selectedDay = signal(this.toDayKey(new Date()));
  protected readonly selectedSegment = signal<BookingSegmentValue>('upcoming');

  /** Días visibles en el selector, con el activo marcado. */
  protected readonly days = computed<BookingDay[]>(() => {
    const selected = this.selectedDay();

    return Array.from({ length: DAYS_WINDOW }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      const key = this.toDayKey(date);

      return {
        key,
        weekday: date
          .toLocaleDateString('es-CO', { weekday: 'short' })
          .replace('.', '')
          .toUpperCase(),
        dayNumber: String(date.getDate()),
        isToday: index === 0,
        isSelected: key === selected,
      };
    });
  });

  /** Reservas visibles según el segmento activo. */
  protected readonly visibleBookings = computed<BookingView[]>(() => {
    const segment = this.selectedSegment();

    return this.bookings().filter((booking) => {
      const isPast = this.isPast(booking);

      return segment === 'upcoming' ? !isPast : isPast;
    });
  });

  constructor() {
    this.reservasService.getBookings().subscribe((bookings) => this.bookings.set(bookings));
    this.reservasService.getSegments().subscribe((segments) => this.segments.set(segments));
  }

  protected onSegmentChange(value: string): void {
    this.selectedSegment.set(value as BookingSegmentValue);
  }

  protected onManage(booking: BookingView): void {
    this.reservasService.cancelBooking(booking.id).subscribe(() => {
      this.bookings.update((bookings) =>
        bookings.filter((item) => item.id !== booking.id),
      );
    });
  }

  protected onShare(booking: BookingView): void {
    void this.router.navigate(['/reservas'], {
      queryParams: { share: booking.code },
    });
  }

  /** Una reserva es "anterior" si su fecha ya pasó. */
  private isPast(booking: BookingView): boolean {
    if (!booking.matchDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(`${booking.matchDate}T00:00:00`);

    return date < today;
  }

  /** Clave `yyyy-mm-dd` de una fecha. */
  private toDayKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
