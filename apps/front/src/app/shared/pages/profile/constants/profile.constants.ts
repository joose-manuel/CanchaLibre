import { PlayerLevel } from '@canchalibre/shared-domain';
import {
  MatchHistoryEntry,
  PlayerLevelKey,
  ProfileSettingSection,
  ProfileSport,
  ProfileUser,
} from '../interfaces/profile.interface';

/**
 * Datos quemados de la página de perfil.
 *
 * Sólo se usan como fallback cuando la API no responde (o el usuario aún no
 * tiene sesión). Todo lo que sí existe en el backend se pide por el
 * `ProfileService`.
 */

/** Etiquetas legibles para el nivel del jugador. */
export const LEVEL_LABELS: Record<PlayerLevelKey, string> = {
  [PlayerLevel.Beginner]: 'Principiante',
  [PlayerLevel.Intermediate]: 'Intermedio',
  [PlayerLevel.SemiPro]: 'Semi-Pro',
  [PlayerLevel.Pro]: 'Pro',
};

/** Insignia de nivel mostrada junto a los deportes. */
export const LEVEL_BADGES: Record<PlayerLevelKey, string> = {
  [PlayerLevel.Beginner]: 'LVL 1',
  [PlayerLevel.Intermediate]: 'LVL 3',
  [PlayerLevel.SemiPro]: 'LVL 4',
  [PlayerLevel.Pro]: 'LVL 5',
};

/** Deportes que puede practicar el usuario. */
export const PROFILE_SPORTS: ProfileSport[] = [
  { key: 'futbol', label: 'Fútbol' },
  { key: 'padel', label: 'Pádel' },
  { key: 'basket', label: 'Basket' },
];

/** Usuario quemado: se usa cuando `GET /users/me` no está disponible. */
export const FALLBACK_USER: ProfileUser = {
  id: 'u-1',
  fullName: 'Mateo Rodríguez',
  email: 'mateo@canchalibre.co',
  avatarUrl: 'images/avatar-carlos.png',
  city: 'Bogotá, Colombia',
  level: PlayerLevel.SemiPro,
  levelLabel: LEVEL_LABELS['semi-pro'],
  levelBadge: LEVEL_BADGES['semi-pro'],
  role: 'player',
  isOwner: false,
  sports: PROFILE_SPORTS,
};

/**
 * Marcadores quemados. El backend todavía no expone el score de los
 * partidos, así que el servicio los toma de aquí mientras haya partidas.
 */
export const FALLBACK_SCORES: { score: string; result: MatchHistoryEntry['result'] }[] = [
  { score: '4 - 2', result: 'victoria' },
  { score: '1 - 3', result: 'derrota' },
];

/** Historial quemado usado cuando la API no devuelve reservas. */
export const FALLBACK_HISTORY: MatchHistoryEntry[] = [
  {
    id: 'h-1',
    venueName: 'Cancha Los Héroes',
    dateLabel: 'Ayer, 18:00',
    sportLabel: 'Fútbol 5',
    sport: 'futbol',
    score: '4 - 2',
    result: 'victoria',
    resultLabel: 'Victoria',
  },
  {
    id: 'h-2',
    venueName: 'Club Campestre',
    dateLabel: '12 Jun, 19:30',
    sportLabel: 'Fútbol 8',
    sport: 'futbol',
    score: '1 - 3',
    result: 'derrota',
    resultLabel: 'Derrota',
  },
];

/** Opciones de configuración del perfil. */
export const PROFILE_SETTINGS: ProfileSettingSection[] = [
  {
    title: 'Notificaciones',
    items: [
      {
        key: 'notifications',
        label: 'Notificaciones',
        icon: 'pi pi-bell',
        kind: 'toggle',
        tone: 'default',
        value: true,
      },
    ],
  },
  {
    title: 'Apariencia',
    items: [
      {
        key: 'dark-mode',
        label: 'Modo oscuro',
        icon: 'pi pi-moon',
        kind: 'toggle',
        tone: 'default',
        value: false,
      },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      {
        key: 'privacy',
        label: 'Privacidad',
        icon: 'pi pi-lock',
        kind: 'link',
        tone: 'default',
      },
      {
        key: 'logout',
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        kind: 'link',
        tone: 'danger',
      },
    ],
  },
];
