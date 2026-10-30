import { SportKey } from './sport.interface';

export interface MatchSummary {
  id: string;
  sport: SportKey;
  sportLabel: string;
  venue: string;
  address: string;
  startTime: string;
  joinedPlayers: number;
  totalPlayers: number;
  imageSrc: string;
  /** Distancia a la sede en km (para el "1,2 km" del diseño). */
  distanceKm?: number;
  /** "Hoy" / "Mañana" / "Sáb, 1 Nov" */
  dateLabel?: string;
  /** Minutos hasta que empieza (para la cuenta regresiva). */
  startsInMinutes?: number;
}
