import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BookingStatus, OwnerScheduleItem } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';
import { AdminReservation } from '../../../interfaces/owner.interface';
import { FALLBACK_RESERVATIONS } from '../constants/reservas-admin.constants';

/**
 * Servicio de la lista y el detalle de reservas (vista del propietario).
 *
 * - `GET  /owner/bookings` -> todas las reservas de sus sedes.
 * - `GET  /bookings/:id`   -> detalle de una reserva.
 *
 * Si la API no responde se devuelve la data quemada de
 * `constants/reservas-admin.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class ReservasAdminService {
  private readonly http = inject(HttpClient);

  /** Lista de reservas del propietario. */
  getReservations(): Observable<AdminReservation[]> {
    return this.http
      .get<OwnerScheduleItem[]>(`${API_BASE_URL}/owner/bookings`)
      .pipe(
        map((items) => items.map((item) => this.toReservation(item))),
        map((items) => (items.length > 0 ? items : FALLBACK_RESERVATIONS)),
        catchError(() => of(FALLBACK_RESERVATIONS)),
      );
  }

  /** Confirma una reserva. */
  confirm(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/confirm`);
  }

  /** Rechaza una reserva. */
  reject(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/reject`);
  }

  /** Marca un no-show. */
  noShow(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/no-show`);
  }

  /** Traduce un item del schedule al modelo de la lista. */
  private toReservation(item: OwnerScheduleItem): AdminReservation {
    return {
      id: item.bookingId,
      customerName: item.organizerName || 'Cliente',
      codeLabel: `ID: #${item.code}`,
      status: item.status,
      statusLabel: this.toStatusLabel(item.status),
      statusTone: this.toStatusTone(item.status),
      dateLabel: this.toDateLabel(item.matchDate),
      timeLabel: this.to12h(item.startTime),
      detailLabel: `${item.spaceName} · ${item.venueName}`,
      priceLabel: this.toMoney(item.depositAmount),
    };
  }

  private toStatusLabel(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'CONFIRMADA';
      case BookingStatus.Paid:
        return 'PAGADA';
      case BookingStatus.Pending:
        return 'PENDIENTE';
      case BookingStatus.Cancelled:
        return 'CANCELADA';
      case BookingStatus.Rejected:
        return 'RECHAZADA';
      default:
        return 'NO ASISTIÓ';
    }
  }

  private toStatusTone(status: BookingStatus): AdminReservation['statusTone'] {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'confirmed';
      case BookingStatus.Paid:
        return 'paid';
      case BookingStatus.Pending:
        return 'pending';
      default:
        return 'cancelled';
    }
  }

  /** "24 May, 2024" */
  private toDateLabel(matchDate: string): string {
    const date = new Date(`${matchDate}T00:00:00`);

    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  /** "18:00" -> "6:00 PM" */
  private to12h(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }

  /** "$120.00" */
  private toMoney(amount: number): string {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private post(path: string): Observable<boolean> {
    return this.http
      .post(`${API_BASE_URL}${path}`, {}, { headers: this.authHeaders() })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
