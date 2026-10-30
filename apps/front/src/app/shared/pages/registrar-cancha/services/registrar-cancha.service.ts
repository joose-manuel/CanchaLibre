import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BalanceMethod,
  City,
  Space,
  Sport,
  VenueDetails,
  VenueSummary,
} from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import {
  FALLBACK_CITIES,
  FALLBACK_SPORTS,
} from '../constants/registrar-cancha.constants';
import {
  CityOption,
  OwnedVenueView,
  SpaceDraft,
  SportOption,
  VenueBasicInfo,
  VenuePolicies,
} from '../interfaces/registrar-cancha.interface';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';

/**
 * Servicio del asistente de registro de sede.
 *
 * - `GET  /cities`              -> ciudades disponibles.
 * - `GET  /sports`              -> deportes de la plataforma.
 * - `GET  /venues/mine`         -> sedes propias (página "Mis Canchas").
 * - `GET  /venues/:id`          -> detalle de una sede con sus espacios.
 * - `POST /venues`              -> crea la sede.
 * - `POST /venues/:venueId/spaces` -> crea un espacio.
 * - `PUT  /venues/:id/policies` -> guarda las políticas de pago.
 *
 * Si la API no responde se devuelven los datos quemados de
 * `constants/registrar-cancha.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class RegistrarCanchaService {
  private readonly http = inject(HttpClient);

  /** Ciudades donde se puede registrar una sede. */
  getCities(): Observable<CityOption[]> {
    return this.http.get<City[]>(`${API_BASE_URL}/cities`).pipe(
      map((cities) => cities.map((city) => ({ id: city.id, name: city.name }))),
      catchError(() => of(FALLBACK_CITIES)),
    );
  }

  /** Deportes de la plataforma. */
  getSports(): Observable<SportOption[]> {
    return this.http.get<Sport[]>(`${API_BASE_URL}/sports`).pipe(
      map((sports) => sports.map((sport) => this.toSport(sport))),
      catchError(() => of(FALLBACK_SPORTS)),
    );
  }

  /** Sedes propias del usuario. */
  getMyVenues(): Observable<OwnedVenueView[]> {
    return this.http.get<VenueSummary[]>(`${API_BASE_URL}/venues/mine`).pipe(
      map((venues) => venues.map((venue) => this.toOwnedVenue(venue))),
      catchError(() => of<OwnedVenueView[]>([])),
    );
  }

  /** Detalle de una sede con sus espacios (para editar). */
  getVenue(venueId: string): Observable<{
    venue: OwnedVenueView;
    spaces: SpaceDraft[];
  } | null> {
    return this.http.get<VenueDetails>(`${API_BASE_URL}/venues/${venueId}`).pipe(
      map((venue) => ({
        venue: this.toOwnedVenue(venue),
        spaces: (venue.spaces ?? []).map((space) => this.toSpace(space)),
      })),
      catchError(() => of(null)),
    );
  }

  /** Crea la sede con los datos del paso 1. */
  createVenue(info: VenueBasicInfo, policies: VenuePolicies): Observable<string> {
    return this.http
      .post<VenueSummary>(
        `${API_BASE_URL}/venues`,
        {
          name: info.name,
          address: info.address,
          cityId: info.cityId,
          phone: info.phone,
          // La API exige coordenadas; se centran en la ciudad elegida.
          lat: 0,
          lng: 0,
          depositPercent: policies.depositPercent,
          cancelWindowHours: policies.cancelWindowHours,
          balanceMethod: policies.balanceMethod,
          sportIds: info.sportIds,
        },
        { headers: this.authHeaders() },
      )
      .pipe(
        map((venue) => venue.id),
        catchError(() => of('')),
      );
  }

  /** Añade un espacio a la sede. */
  createSpace(
    venueId: string,
    space: SpaceDraft,
    pricePerHour = 0,
  ): Observable<boolean> {
    return this.http
      .post(
        `${API_BASE_URL}/venues/${venueId}/spaces`,
        {
          name: space.name,
          capacity: space.capacity,
          type: space.type,
          pricePerHour,
          sportIds: space.sportIds,
        },
        { headers: this.authHeaders() },
      )
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /** Guarda las políticas de anticipo, cancelación y pago. */
  savePolicies(venueId: string, policies: VenuePolicies): Observable<boolean> {
    return this.http
      .put(
        `${API_BASE_URL}/venues/${venueId}/policies`,
        {
          depositPercent: policies.depositPercent,
          cancelWindowHours: policies.cancelWindowHours,
          balanceMethod: policies.balanceMethod,
        },
        { headers: this.authHeaders() },
      )
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  /** Traduce un deporte de la API a la opción de la interfaz. */
  private toSport(sport: Sport): SportOption {
    const normalized = sport.name.toLowerCase();

    const icon = normalized.includes('padel')
      ? 'pi pi-circle'
      : normalized.includes('basket') || normalized.includes('balonces')
        ? 'pi pi-circle'
        : normalized.includes('tenis')
          ? 'pi pi-circle'
          : normalized.includes('voley')
            ? 'pi pi-circle'
            : normalized.includes('gimnas')
              ? 'pi pi-bolt'
              : 'pi pi-circle';

    return { id: sport.id, name: sport.name, icon };
  }

  /** Traduce una sede de la API a la vista de la lista. */
  private toOwnedVenue(venue: VenueSummary): OwnedVenueView {
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city?.name ?? '',
      imageSrc: venue.coverUrl ?? 'images/field-grass.png',
      sports: (venue.sports ?? []).map((sport) => sport.name),
      spaceCount: venue.spaceCount ?? 0,
      depositLabel: `Anticipo ${venue.depositPercent}%`,
      balanceLabel:
        venue.balanceMethod === BalanceMethod.App
          ? 'En la aplicación'
          : 'En el establecimiento',
    };
  }

  /** Traduce un espacio de la API al borrador del formulario. */
  private toSpace(space: Space): SpaceDraft {
    const sports = space.sports ?? [];

    return {
      id: space.id,
      name: space.name,
      capacity: space.capacity,
      type: space.type,
      sportIds: sports.map((sport) => sport.id),
      icon: 'pi pi-th-large',
      summary: `${sports[0]?.name ?? 'Deporte'} • Cap. ${space.capacity} pers.`,
    };
  }

  /** Cabecera de autorización si hay sesión activa. */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
