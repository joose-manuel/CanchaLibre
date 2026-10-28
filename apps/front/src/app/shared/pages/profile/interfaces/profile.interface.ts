/**
 * Tipos de la vista de perfil.
 *
 * Estos modelos son "view models" de la web: aíslan a la página de la forma
 * exacta que devuelve la API. El `ProfileService` es el único que conoce el
 * contrato del backend y traduce a estas interfaces.
 */

import { PlayerLevel } from '@canchalibre/shared-domain';

export type PlayerLevelKey = PlayerLevel;

export type ProfileRole = 'player' | 'owner';

export type MatchResult = 'victoria' | 'derrota' | 'empate';

export type ProfileSportKey = 'futbol' | 'padel' | 'basket' | 'tenis';

export type SettingKind = 'toggle' | 'link';

export type SettingTone = 'default' | 'danger';

export interface ProfileSport {
  key: ProfileSportKey;
  label: string;
}

export interface ProfileUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  city: string;
  level: PlayerLevelKey;
  levelLabel: string;
  levelBadge: string;
  role: ProfileRole;
  isOwner: boolean;
  sports: ProfileSport[];
}

export interface MatchHistoryEntry {
  id: string;
  venueName: string;
  dateLabel: string;
  sportLabel: string;
  sport: ProfileSportKey;
  score: string;
  result: MatchResult;
  resultLabel: string;
}

export interface ProfileSettingItem {
  key: string;
  label: string;
  icon: string;
  kind: SettingKind;
  tone: SettingTone;
  value?: boolean;
}

export interface ProfileSettingSection {
  title: string;
  items: ProfileSettingItem[];
}

export interface ProfilePageState {
  user: ProfileUser;
  history: MatchHistoryEntry[];
  settings: ProfileSettingSection[];
}
