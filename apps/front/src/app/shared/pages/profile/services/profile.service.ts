import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BookingSummary, User, UserRole } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import {
  FALLBACK_HISTORY,
  FALLBACK_SCORES,
  FALLBACK_USER,
  LEVEL_BADGES,
  LEVEL_LABELS,
  PROFILE_SETTINGS,
  PROFILE_SPORTS,
} from '../constants/profile.constants';
import {
  MatchHistoryEntry,
  ProfileSettingSection,
  ProfileUser,
} from '../interfaces/profile.interface';
import { API_BASE_URL } from '../../../services/api.config';

/**
 * Servicio de la página de perfil.
 *
 * - `GET  /users/me`              -> datos del usuario (nombre, nivel, ciudad, rol).
 * - `GET  /bookings/mine`         -> historial de partidos del usuario.
 * - `POST /users/me/become-owner` -> cambia el rol del usuario a propietario.
 *
 * Si la API no responde (o el usuario no tiene token) se devuelve la data
 * quemada de `constants/profile.constants.ts`.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  /** Perfil del usuario autenticado. */
  getProfile(): Observable<ProfileUser> {
    return this.http.get<User>(`${API_BASE_URL}/users/me`).pipe(
      map((user) => this.toProfileUser(user)),
      catchError(() => of(FALLBACK_USER)),
    );
  }

  /** Historial de partidos del usuario (partidos donde participó o creó). */
  getMatchHistory(): Observable<MatchHistoryEntry[]> {
    return this.http.get<BookingSummary[]>(`${API_BASE_URL}/bookings/mine`).pipe(
      map((bookings) => bookings.map((booking, index) => this.toHistoryEntry(booking, index))),
      catchError(() => of(FALLBACK_HISTORY)),
    );
  }

  /** Opciones de configuración de la página. */
  getSettings(): Observable<ProfileSettingSection[]> {
    return of(PROFILE_SETTINGS);
  }

  /** Solicita el cambio de rol a propietario (modo canchas). */
  becomeOwner(): Observable<ProfileUser> {
    return this.http.post<User>(`${API_BASE_URL}/users/me/become-owner`, {}).pipe(
      map((user) => this.toProfileUser(user)),
      catchError(() =>
        of({
          ...FALLBACK_USER,
          role: 'owner' as const,
          isOwner: true,
        }),
      ),
    );
  }

  /** Traduce el usuario de la API al view model de la página. */
  private toProfileUser(user: User): ProfileUser {
    const level = user.level;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? FALLBACK_USER.avatarUrl,
      city: this.toCityLabel(user),
      level,
      levelLabel: LEVEL_LABELS[level] ?? FALLBACK_USER.levelLabel,
      levelBadge: LEVEL_BADGES[level] ?? FALLBACK_USER.levelBadge,
      role: user.role === UserRole.Owner ? 'owner' : 'player',
      isOwner: user.role === UserRole.Owner,
      sports: PROFILE_SPORTS,
    };
  }

  /** Traduce una reserva de la API a una fila del historial. */
  private toHistoryEntry(booking: BookingSummary, index: number): MatchHistoryEntry {
    const match = booking.match;
    const fallbackScore = FALLBACK_SCORES[index % FALLBACK_SCORES.length];

    return {
      id: booking.id,
      venueName: match?.venue?.name ?? 'Cancha sin nombre',
      dateLabel: this.toDateLabel(match?.matchDate, match?.startTime),
      sportLabel: match?.sport?.name ?? 'Deporte',
      sport: this.toSportKey(match?.sport?.name),
      score: fallbackScore.score,
      result: fallbackScore.result,
      resultLabel: fallbackScore.result === 'victoria' ? 'Victoria' : 'Derrota',
    };
  }

  /** Etiqueta de ciudad: "Bogotá, Colombia". */
  private toCityLabel(user: User): string {
    const city = user.city;

    if (!city) {
      return FALLBACK_USER.city;
    }

    return city.department ? `${city.name}, ${city.department}` : city.name;
  }

  /** Etiqueta de fecha: "Hoy, 18:00" / "Ayer, 18:00" / "12 Jun, 19:30". */
  private toDateLabel(matchDate?: string, startTime?: string): string {
    if (!matchDate) {
      return 'Fecha por definir';
    }

    const date = new Date(`${matchDate}T00:00:00`);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const time = startTime?.slice(0, 5) ?? '';
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return time ? `Hoy, ${time}` : 'Hoy';
    }

    if (isYesterday) {
      return time ? `Ayer, ${time}` : 'Ayer';
    }

    const month = date
      .toLocaleDateString('es-CO', { month: 'short' })
      .replace('.', '')
      .toUpperCase();

    return time ? `${date.getDate()} ${month}, ${time}` : `${date.getDate()} ${month}`;
  }

  /** Determina el deporte a partir del nombre que devuelve la API. */
  private toSportKey(sportName?: string): MatchHistoryEntry['sport'] {
    const name = (sportName ?? '').toLowerCase();

    if (name.includes('pádel') || name.includes('padel')) {
      return 'padel';
    }

    if (name.includes('basket')) {
      return 'basket';
    }

    if (name.includes('tenis')) {
      return 'tenis';
    }

    return 'futbol';
  }
}
