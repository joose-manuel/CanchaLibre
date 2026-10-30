import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BookingStatus, OwnerScheduleItem } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';
import { AgendaEntry, AgendaStats } from '../../../interfaces/owner.interface';
import { FALLBACK_AGENDA } from '../constants/agenda.constants';

/**
 * Servicio de la agenda del propietario.
 *
 * - `GET  /owner/schedule`               -> reservas del día (o de la fecha).
 * - `POST /owner/bookings/:id/confirm`   -> confirma una reserva.
 * - `POST /owner/bookings/:id/reject`    -> rechaza una reserva.
 * - `POST /owner/bookings/:id/no-show`   -> marca un no-show.
 *
 * Si la API no responde se devuelve la data quemada de
 * `constants/agenda.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);

  /** Reservas del día (o de la fecha indicada). */
  getSchedule(date: string): Observable<AgendaEntry[]> {
    return this.http
      .get<OwnerScheduleItem[]>(`${API_BASE_URL}/owner/schedule`, {
        params: { date },
      })
      .pipe(
        map((items) => items.map((item) => this.toEntry(item))),
        map((entries) => (entries.length > 0 ? entries : FALLBACK_AGENDA)),
        catchError(() => of(FALLBACK_AGENDA)),
      );
  }

  /** Métricas de la cabecera (reservas, anticipos, bloqueos). */
  getStats(entries: AgendaEntry[]): AgendaStats {
    const deposits = entries.reduce(
      (total, entry) => total + entry.depositAmount,
      0,
    );

    return {
      reservations: entries.filter((entry) => !entry.isBlock).length,
      deposits,
      blocks: entries.filter((entry) => entry.isBlock).length,
    };
  }

  /** Confirma una reserva. */
  confirm(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/confirm`);
  }

  /** Rechaza una reserva. */
  reject(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/reject`);
  }

  /** Marca una reserva como no-show. */
  noShow(bookingId: string): Observable<boolean> {
    return this.post(`/owner/bookings/${bookingId}/no-show`);
  }

  /** Traduce un item del schedule al modelo de la agenda. */
  private toEntry(item: OwnerScheduleItem): AgendaEntry {
    const status = this.toStatus(item.status);

    return {
      id: item.bookingId,
      code: item.code,
      title: `${item.spaceName} - ${item.venueName}`,
      organizerName: item.organizerName,
      timeLabel: this.to12h(item.startTime),
      durationLabel: this.toDuration(item.startTime, item.endTime),
      rangeLabel: `${this.to12h(item.startTime)} - ${this.to12h(item.endTime)}`,
      status,
      statusLabel: this.toStatusLabel(status),
      statusNote: this.toStatusNote(status),
      depositAmount: item.depositAmount,
      actionable: status === 'pending',
      isBlock: false,
    };
  }

  private toStatus(status: BookingStatus): AgendaEntry['status'] {
    switch (status) {
      case BookingStatus.Confirmed:
      case BookingStatus.Paid:
        return 'confirmed';
      case BookingStatus.Pending:
        return 'pending';
      case BookingStatus.Cancelled:
      case BookingStatus.Rejected:
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private toStatusLabel(status: AgendaEntry['status']): string {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMADA';
      case 'pending':
        return 'PENDIENTE';
      case 'blocked':
        return 'BLOQUEADO';
      default:
        return 'CANCELADA';
    }
  }

  private toStatusNote(status: AgendaEntry['status']): string {
    switch (status) {
      case 'confirmed':
        return 'Pagado';
      case 'pending':
        return 'Falta confirmar';
      case 'blocked':
        return 'Bloqueado por Admin';
      default:
        return 'Cancelada';
    }
  }

  /** "18:00" -> "6:00 PM" */
  private to12h(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }

  /** "60 min" a partir del inicio y el fin. */
  private toDuration(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const total = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    return `${Math.max(0, total)} min`;
  }

  /** POST auxiliar del módulo owner. */
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
