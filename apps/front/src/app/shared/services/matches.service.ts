import { Injectable } from '@angular/core';
import { MatchSummary } from '../interfaces/match-summary.interface';

const TODAY_MATCHES: MatchSummary[] = [
  {
    id: 'm-1',
    sport: 'futbol',
    sportLabel: 'Fútbol 5',
    venue: 'Cancha Sintética Chapinero',
    address: 'Calle 63 #13-45, Bogotá',
    startTime: '19:00',
    joinedPlayers: 8,
    totalPlayers: 10,
    imageSrc: 'images/field-grass.png',
  },
  {
    id: 'm-2',
    sport: 'padel',
    sportLabel: 'Pádel',
    venue: 'Pádel Center Medellín',
    address: 'El Poblado, Medellín',
    startTime: '17:30',
    joinedPlayers: 3,
    totalPlayers: 4,
    imageSrc: 'images/field-padel.png',
  },
];

@Injectable({ providedIn: 'root' })
export class MatchesService {
  getTodayMatches(): MatchSummary[] {
    return TODAY_MATCHES;
  }
}
