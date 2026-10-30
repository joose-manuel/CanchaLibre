import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AvailabilitySlot,
  BlockReason,
  Space,
  VenueDetails,
  VenueSummary,
} from '@canchalibre/shared-domain';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';
import { AvailabilityDay } from '../../../interfaces/owner.interface';
import { FALLBACK_DAYS, FALLBACK_SPACES } from '../constants/disponibilidad.constants';

/**
 * Servicio de la gestión de disponibilidad.
 *
 * - `GET  /venues/mine`                     -> sedes del propietario.
 * - `GET  /venues/:id`                     -> detalle con sus espacios.
 * - `GET  /spaces/:id/availability?date=`  -> franjas del día.
 * - `POST /spaces/:id/blocks`              -> bloquea un rango horario.
 */
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);

  /** Espacios disponibles del propietario. */
  getSpaces(): Observable<{ id: string; name: string }[]> {
    return this.http.get<VenueSummary[]>(`${API_BASE_URL}/venues/mine`).pipe(
      switchMap((venues) => {
        if (venues.length === 0) {
          return of<{ id: string; name: string }[]>([]);
        }

        return forkJoin(
          venues.map((venue) =>
            this.http.get<VenueDetails>(`${API_BASE_URL}/venues/${venue.id}`).pipe(
              map((details) => this.toSpaces(details)),
              catchError(() => of<{ id: string; name: string }[]>([])),
            ),
          ),
        ).pipe(map((groups) => groups.flat()));
      }),
      map((spaces) => (spaces.length > 0 ? spaces : FALLBACK_SPACES)),
      catchError(() => of(FALLBACK_SPACES)),
    );
  }

  /** Grilla de una semana para un espacio. */
  getWeek(spaceId: string): Observable<AvailabilityDay[]> {
    const days = this.weekDays();

    return forkJoin(
      days.map((day) =>
        this.http
          .get<AvailabilitySlot[]>(
            `${API_BASE_URL}/spaces/${spaceId}/availability`,
            { params: { date: day.key } },
          )
          .pipe(
            map((slots) => this.toDay(day, slots)),
            catchError(() => of(this.toDay(day, []))),
          ),
      ),
    ).pipe(
      map((columns) => {
        const hasEntries = columns.some((column) =>
          column.slots.some((slot) => slot.entry !== null),
        );

        return hasEntries ? columns : FALLBACK_DAYS;
      }),
      catchError(() => of(FALLBACK_DAYS)),
    );
  }

  /** Bloquea un rango horario de un espacio. */
  blockRange(
    spaceId: string,
    startAt: string,
    endAt: string,
    reason: BlockReason = BlockReason.Manual,
  ): Observable<boolean> {
    return this.http
      .post(
        `${API_BASE_URL}/spaces/${spaceId}/blocks`,
        { startAt, endAt, reason },
        { headers: this.authHeaders() },
      )
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /** Los siete días de la semana, empezando por hoy. */
  private weekDays(): {
    key: string;
    weekday: string;
    dayNumber: string;
    isToday: boolean;
  }[] {
    const days: {
      key: string;
      weekday: string;
      dayNumber: string;
      isToday: boolean;
    }[] = [];

    for (let index = 0; index < 7; index++) {
      const date = new Date();
      date.setDate(date.getDate() + index);

      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNumber = String(date.getDate()).padStart(2, '0');

      days.push({
        key: `${date.getFullYear()}-${month}-${dayNumber}`,
        weekday: date
          .toLocaleDateString('es-CO', { weekday: 'short' })
          .replace('.', '')
          .toUpperCase(),
        dayNumber: String(date.getDate()),
        isToday: index === 0,
      });
    }

    return days;
  }

  /** Convierte la disponibilidad de un día en la columna de la grilla. */
  private toDay(
    day: { key: string; weekday: string; dayNumber: string; isToday: boolean },
    slots: AvailabilitySlot[],
  ): AvailabilityDay {
    const hours = ['08:00', '09:00', '10:00', '11:00'];

    return {
      weekday: day.weekday,
      dayNumber: day.dayNumber,
      isToday: day.isToday,
      slots: hours.map((hour) => {
        const slot = slots.find((item) => item.startTime.slice(0, 5) === hour);

        return {
          time: hour,
          entry: slot
            ? {
                id: hour,
                label: slot.available ? 'Reservado' : 'Bloqueado',
                tone: slot.available ? ('confirmed' as const) : ('blocked' as const),
              }
            : null,
        };
      }),
    };
  }

  /** Espacios de una sede, con el nombre de la sede para poder elegir. */
  private toSpaces(details: VenueDetails): { id: string; name: string }[] {
    return (details.spaces ?? []).map((space: Space) => ({
      id: space.id,
      name: `${details.name} - ${space.name}`,
    }));
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
