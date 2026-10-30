import { AvailabilityDay } from '../../../interfaces/owner.interface';

/**
 * Datos quemados de la gestión de disponibilidad.
 *
 * Sólo se usan como fallback cuando la API no responde.
 */

/** Espacios de ejemplo. */
export const FALLBACK_SPACES: { id: string; name: string }[] = [
  { id: 'space-1', name: 'Cancha de Padel 1 (Cristal)' },
  { id: 'space-2', name: 'Cancha de Padel 2 (Cristal)' },
  { id: 'space-3', name: 'Cancha de Fútbol 5' },
];

/** Semana de ejemplo: reproduce la grilla del diseño. */
export const FALLBACK_DAYS: AvailabilityDay[] = [
  {
    weekday: 'LUN',
    dayNumber: '23',
    isToday: true,
    slots: [
      { time: '08:00', entry: null },
      {
        time: '09:00',
        entry: { id: 'b1', label: 'CERRADO', tone: 'blocked' },
      },
      {
        time: '10:00',
        entry: { id: 'b2', label: 'TOR-FU', tone: 'confirmed' },
      },
      { time: '11:00', entry: null },
    ],
  },
  {
    weekday: 'MAR',
    dayNumber: '24',
    isToday: false,
    slots: [
      { time: '08:00', entry: null },
      {
        time: '09:00',
        entry: { id: 'b3', label: 'MANTEN.', tone: 'blocked' },
      },
      { time: '10:00', entry: null },
      { time: '11:00', entry: null },
    ],
  },
  {
    weekday: 'MIÉ',
    dayNumber: '25',
    isToday: false,
    slots: [
      { time: '08:00', entry: null },
      { time: '09:00', entry: null },
      {
        time: '10:00',
        entry: { id: 'b4', label: 'RESERVADO', tone: 'confirmed' },
      },
      { time: '11:00', entry: null },
    ],
  },
  {
    weekday: 'JUE',
    dayNumber: '26',
    isToday: false,
    slots: [
      { time: '08:00', entry: null },
      { time: '09:00', entry: null },
      { time: '10:00', entry: null },
      { time: '11:00', entry: null },
    ],
  },
  {
    weekday: 'VIE',
    dayNumber: '27',
    isToday: false,
    slots: [
      { time: '08:00', entry: null },
      { time: '09:00', entry: null },
      { time: '10:00', entry: null },
      {
        time: '11:00',
        entry: { id: 'b5', label: 'PENDIENTE', tone: 'pending' },
      },
    ],
  },
  {
    weekday: 'SÁB',
    dayNumber: '28',
    isToday: false,
    slots: [
      {
        time: '08:00',
        entry: { id: 'b6', label: 'RESERVADO', tone: 'confirmed' },
      },
      { time: '09:00', entry: null },
      {
        time: '10:00',
        entry: { id: 'b7', label: 'RESERVADO', tone: 'confirmed' },
      },
      { time: '11:00', entry: null },
    ],
  },
  {
    weekday: 'DOM',
    dayNumber: '29',
    isToday: false,
    slots: [
      {
        time: '08:00',
        entry: { id: 'b8', label: 'RESERVADO', tone: 'confirmed' },
      },
      {
        time: '09:00',
        entry: { id: 'b9', label: 'RESERVADO', tone: 'confirmed' },
      },
      {
        time: '10:00',
        entry: { id: 'b10', label: 'RESERVADO', tone: 'confirmed' },
      },
      { time: '11:00', entry: null },
    ],
  },
];

/** Porcentaje de ocupación quemado. */
export const FALLBACK_OCCUPANCY = 85;

/** Título de la pantalla. */
export const PAGE_TITLE = 'Gestión de Disponibilidad';

/** Etiqueta del botón de bloqueo. */
export const BLOCK_RANGE_LABEL = 'Bloquear Rango';
