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
}
