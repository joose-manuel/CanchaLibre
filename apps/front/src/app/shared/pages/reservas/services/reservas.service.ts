import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BookingStatus, BookingSummary } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import {
  BOOKING_SEGMENTS,
  BOOKING_STATUS_LABELS,
  FALLBACK_BOOKINGS,
  FALLBACK_BOOKING_IMAGE,
} from '../constants/reservas.constants';
import {
  BookingSegment,
  BookingStatusTone,
  BookingView,
} from '../interfaces/reservas.interface';
import { API_BASE_URL } from '../../../services/api.config';

/**
 * Servicio de la página de reservas.
 *
 * - `GET /bookings/mine` -> reservas del usuario (con el partido embebido).
 * - `POST /bookings/:id/cancel` -> cancela una reserva.
 *
 * Si la API no responde se devuelve la data quemada de
 * `constants/reservas.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);

  /** Reservas del usuario autenticado. */
  getBookings(): Observable<BookingView[]> {
    return this.http.get<BookingSummary[]>(`${API_BASE_URL}/bookings/mine`).pipe(
      map((bookings) => bookings.map((booking) => this.toBookingView(booking))),
      catchError(() => of(FALLBACK_BOOKINGS)),
    );
  }

  /** Segmentos del control superior (Próximas / Anteriores). */
  getSegments(): Observable<BookingSegment[]> {
    return of(BOOKING_SEGMENTS);
  }

  /** Cancela una reserva del usuario. */
  cancelBooking(bookingId: string): Observable<boolean> {
    return this.http
      .post(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {})
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /** Traduce la reserva de la API al view model de la página. */
  private toBookingView(booking: BookingSummary): BookingView {
    const match = booking.match;
    const capacity = match?.capacity ?? 0;
    const joined = match?.joinedPlayers ?? 0;

    return {
      id: booking.id,
      code: booking.code,
      venueName: match?.venue?.name ?? 'Cancha sin nombre',
      spaceName: match?.space?.name ?? null,
      sportLabel: match?.sport?.name ?? 'Deporte',
      matchDate: match?.matchDate ?? '',
      dateLabel: this.toDateLabel(match?.matchDate),
      timeLabel: this.toTimeLabel(match?.startTime),
      status: booking.status,
      statusLabel: this.toStatusLabel(booking.status),
      statusTone: this.toStatusTone(booking.status),
      imageSrc: match?.venue?.coverUrl ?? FALLBACK_BOOKING_IMAGE,
      priceLabel: this.toPriceLabel(booking),
      priceCaption: booking.serviceFee > 0 ? 'Pago dividido' : null,
      participants: [],
      missingPlayers: Math.max(0, capacity - joined),
      fillPercent:
        capacity > 0 ? Math.min(100, Math.round((joined / capacity) * 100)) : 0,
      manageable: booking.status !== BookingStatus.Cancelled,
    };
  }

  /** Estado: la API usa `pending` para lo que la UI llama "Planeada". */
  private toStatusLabel(status: BookingStatus): string {
    if (status === BookingStatus.Pending) {
      return 'PLANEADA';
    }

    return BOOKING_STATUS_LABELS[status];
  }

  /** Tono visual según el estado. */
  private toStatusTone(status: BookingStatus): BookingStatusTone {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'confirmed';
      case BookingStatus.Paid:
        return 'paid';
      case BookingStatus.Pending:
        return 'planned';
      case BookingStatus.Cancelled:
      case BookingStatus.Rejected:
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /** Precio a pagar por el usuario. */
  private toPriceLabel(booking: BookingSummary): string | null {
    const amount = booking.depositAmount + booking.serviceFee;

    if (amount <= 0) {
      return null;
    }

    return this.toCop(amount);
  }

  /** Etiqueta de fecha: "Hoy, 23 Oct" / "Sáb, 28 Oct". */
  private toDateLabel(matchDate?: string): string {
    if (!matchDate) {
      return 'Fecha por definir';
    }

    const date = new Date(`${matchDate}T00:00:00`);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const month = date
      .toLocaleDateString('es-CO', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
    const day = date.getDate();

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${day} ${month}`;
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${day} ${month}`;
    }

    const weekday = date
      .toLocaleDateString('es-CO', { weekday: 'short' })
      .replace('.', '')
      .toUpperCase();

    return `${weekday}, ${day} ${month}`;
  }

  /** Hora de inicio en formato 12h: "6:00 PM". */
  private toTimeLabel(startTime?: string): string {
    if (!startTime) {
      return '';
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }

  /** Formato de pesos colombianos: "$15.000 COP". */
  private toCop(amount: number): string {
    return `$${amount.toLocaleString('es-CO')} COP`;
  }
}
