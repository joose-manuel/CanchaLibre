import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AvailabilitySlot,
  BookingDetails,
  MatchDetails,
  SpaceStatus,
  VenueDetails,
  VenueSummary,
} from '@canchalibre/shared-domain';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  FALLBACK_COURTS,
  FALLBACK_SLOTS,
  toCop,
} from '../constants/crear-partido.constants';
import {
  CourtOption,
  CourtSport,
  CourtSportKey,
  CreatedMatch,
  CreateMatchDraft,
  TimeSlotOption,
} from '../interfaces/crear-partido.interface';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';

/**
 * Servicio de la página "Crear Partido".
 *
 * - `GET /venues` -> sedes disponibles (para el buscador del paso 1).
 * - `GET /venues/:id` -> detalle con sus espacios (canchas).
 * - `GET /spaces/:id/availability` -> franjas horarias del paso 2.
 * - `POST /matches` -> crea el partido (y su reserva).
 * - `POST /payments/deposit` -> cobra el adelanto.
 * - `GET /bookings/:id` -> trae el payload del QR de acceso.
 *
 * Si la API no responde se devuelve la data quemada de
 * `constants/crear-partido.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class CrearPartidoService {
  private readonly http = inject(HttpClient);

  /**
   * Canchas seleccionables del paso 1.
   *
   * La API expone las sedes y, dentro de cada una, sus espacios. Por eso se
   * piden las sedes y luego el detalle de cada una: cada espacio es una
   * cancha reservable (y es lo que se envía al crear el partido).
   */
  getCourts(query = ''): Observable<CourtOption[]> {
    return this.http
      .get<VenueSummary[]>(`${API_BASE_URL}/venues`, {
        params: query ? { q: query } : {},
      })
      .pipe(
        switchMap((venues) => {
          if (venues.length === 0) {
            return of<CourtOption[]>([]);
          }

          return forkJoin(
            venues.map((venue) =>
              this.http
                .get<VenueDetails>(`${API_BASE_URL}/venues/${venue.id}`)
                .pipe(
                  map((details) => this.toCourts(details)),
                  catchError(() => of<CourtOption[]>([])),
                ),
            ),
          ).pipe(map((groups) => groups.flat()));
        }),
        map((courts) => (courts.length > 0 ? courts : FALLBACK_COURTS)),
        catchError(() => of(FALLBACK_COURTS)),
      );
  }

  /** Franjas horarias disponibles de una cancha para una fecha. */
  getAvailability(spaceId: string, date: string): Observable<TimeSlotOption[]> {
    return this.http
      .get<AvailabilitySlot[]>(`${API_BASE_URL}/spaces/${spaceId}/availability`, {
        params: { date },
      })
      .pipe(
        map((slots) => slots.map((slot) => this.toSlot(slot))),
        map((slots) => (slots.length > 0 ? slots : FALLBACK_SLOTS)),
        catchError(() => of(FALLBACK_SLOTS)),
      );
  }

  /** Crea el partido y devuelve los ids de partido y reserva. */
  createMatch(draft: CreateMatchDraft): Observable<CreatedMatch> {
    return this.http
      .post<MatchDetails>(`${API_BASE_URL}/matches`, draft, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((match) => ({
          matchId: match.id,
          bookingId: match.booking?.id ?? '',
          code: match.booking?.code ?? '',
          qrPayload: '',
        })),
        catchError(() =>
          of({
            matchId: 'local-match',
            bookingId: 'local-booking',
            code: 'CL-0000',
            qrPayload: '',
          }),
        ),
      );
  }

  /** Cobra el adelanto de la reserva. */
  payDeposit(bookingId: string): Observable<boolean> {
    return this.http
      .post(
        `${API_BASE_URL}/payments/deposit`,
        { bookingId, method: 'sandbox' },
        { headers: this.authHeaders() },
      )
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /** Trae el payload del QR de acceso a la cancha. */
  getQrPayload(bookingId: string): Observable<string> {
    return this.http
      .get<BookingDetails>(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((booking) => booking.qrPayload),
        catchError(() => of('')),
      );
  }

  /** Convierte el detalle de una sede en sus canchas reservables. */
  private toCourts(details: VenueDetails): CourtOption[] {
    const spaces = details.spaces ?? [];

    return spaces
      .filter((space) => space.status === SpaceStatus.Active)
      .map((space) => {
        const sports = space.sports?.length ? space.sports : details.sports ?? [];
        const firstSport = sports[0];

        return {
          id: space.id,
          venueId: details.id,
          name: details.name,
          spaceName: space.name,
          address: details.address,
          city: details.city?.name ?? 'Bogotá',
          imageSrc: details.coverUrl ?? 'images/field-grass.png',
          sports: sports.map((sport) => this.toSport(sport.name)),
          distanceKm: details.distanceKm ?? null,
          distanceLabel: this.toDistanceLabel(details.distanceKm),
          pricePerHour: space.pricePerHour,
          priceLabel: toCop(space.pricePerHour),
          capacity: space.capacity,
          sportId: firstSport?.id ?? 1,
        } satisfies CourtOption;
      });
  }

  /** Convierte la respuesta de disponibilidad en una franja. */
  private toSlot(slot: AvailabilitySlot): TimeSlotOption {
    const start = slot.startTime.slice(0, 5);
    const end = slot.endTime.slice(0, 5);

    return {
      value: start,
      endTime: end,
      label: `${start} - ${end}`,
      available: slot.available,
      price: slot.price ?? null,
    };
  }

  /** Nombre de deporte de la API -> clave del icon vectorial. */
  private toSport(name: string): CourtSport {
    const normalized = name.toLowerCase();
    const key: CourtSportKey = normalized.includes('padel')
      ? 'padel'
      : normalized.includes('basket') || normalized.includes('balonces')
        ? 'basket'
        : 'futbol';

    return { key, label: name };
  }

  /** "A 1.2 KM" / "A 850 M" / "" */
  private toDistanceLabel(distanceKm?: number | null): string {
    if (distanceKm === null || distanceKm === undefined) {
      return '';
    }

    if (distanceKm < 1) {
      return `A ${Math.round(distanceKm * 1000)} M`;
    }

    return `A ${distanceKm.toFixed(1)} KM`;
  }

  /** Cabecera de autorización si hay sesión activa. */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
