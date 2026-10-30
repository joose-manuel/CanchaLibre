import { Injectable } from '@angular/core';
import { MatchSummary } from '../../../interfaces/match-summary.interface';

/**
 * Partidos de hoy.
 *
 * Datos quemados: el backend todavía no expone el listado del día, así que
 * el servicio los devuelve mientras tanto. `startsInMinutes` alimenta la
 * cuenta regresiva de la card protagonista.
 */
const TODAY_MATCHES: MatchSummary[] = [
  {
    id: 'm-1',
    sport: 'futbol',
    sportLabel: 'Fútbol',
    venue: 'Cancha Sintética Chapinero',
    address: 'Calle 63 #13-45',
    startTime: '16:00',
    dateLabel: 'Hoy',
    joinedPlayers: 8,
    totalPlayers: 10,
    distanceKm: 1.2,
    startsInMinutes: 176,
    imageSrc: 'images/field-grass.png',
  },
  {
    id: 'm-2',
    sport: 'padel',
    sportLabel: 'Pádel',
    venue: 'Pádel Club Usaquén',
    address: 'Cra 7 #119-20',
    startTime: '17:30',
    dateLabel: 'Hoy',
    joinedPlayers: 3,
    totalPlayers: 4,
    distanceKm: 3.4,
    imageSrc: 'images/field-padel.png',
  },
  {
    id: 'm-3',
    sport: 'futbol',
    sportLabel: 'Fútbol',
    venue: 'Complejo El Campín',
    address: 'Cra 30 #57-60',
    startTime: '20:30',
    dateLabel: 'Hoy',
    joinedPlayers: 5,
    totalPlayers: 10,
    distanceKm: 4,
    imageSrc: 'images/field-grass.png',
  },
];

@Injectable({ providedIn: 'root' })
export class MatchesService {
  getTodayMatches(): MatchSummary[] {
    return TODAY_MATCHES;
  }
}
