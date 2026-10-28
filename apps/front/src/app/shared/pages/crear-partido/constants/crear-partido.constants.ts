import { MatchFormat } from '@canchalibre/shared-domain';
import {
  CourtOption,
  FormatOption,
  TimeSlotOption,
} from '../interfaces/crear-partido.interface';

/**
 * Datos quemados de la página "Crear Partido".
 *
 * Sólo se usan como fallback cuando la API no responde. Todo lo que existe
 * en el backend se pide por el `CrearPartidoService`.
 */

/** Tarifa de servicio por jugador (se suma al cupo de cada uno). */
export const SERVICE_FEE_PER_PLAYER = 250;

/** Porcentaje que se cobra por adelantado al crear la reserva. */
export const DEPOSIT_PERCENT = 30;

/** Formatos de juego ofrecidos. */
export const MATCH_FORMATS: FormatOption[] = [
  {
    value: MatchFormat.FiveVFive,
    label: '5 v 5',
    playersLabel: '10 Jugadores',
    capacity: 10,
  },
  {
    value: MatchFormat.SevenVSeven,
    label: '7 v 7',
    playersLabel: '14 Jugadores',
    capacity: 14,
  },
];

/** Política de cancelación mostrada en el resumen. */
export const CANCELLATION_POLICY =
  'Reembolso completo si cancelas con más de 24 horas de anticipación. ' +
  'Las cancelaciones dentro de las 24 horas vorher no son reembolsables.';

/** Texto de ayuda del paso 1. */
export const COURT_SEARCH_HINT =
  'Busca el lugar perfecto para tu próximo encuentro.';

/** Etiqueta del botón que avanza de paso. */
export const NEXT_LABEL = 'Siguiente';

/** Etiqueta del botón que crea el partido y cobra el adelanto. */
export const CREATE_AND_PAY_LABEL = 'Crear y Pagar mi Cuota';

/** Etiqueta del botón que crea el partido sin cobrar. */
export const CREATE_ONLY_LABEL = 'Solo Crear Partido';

/** Imagen usada cuando la cancha no tiene portada. */
export const FALLBACK_COURT_IMAGE = 'images/field-grass.png';

/** Formato de pesos: "$120.000 COP". */
export function toCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}

/**
 * Fecha `yyyy-mm-dd` a N días desde hoy.
 */
export function dayFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Cancha quemada: se usa cuando `GET /venues` no está disponible. */
export const FALLBACK_COURTS: CourtOption[] = [
  {
    id: 'space-1',
    venueId: 'venue-1',
    name: 'Canchas El Campín',
    spaceName: 'Cancha Sintética 3',
    address: 'Cra. 57 #24-10',
    city: 'Bogotá',
    imageSrc: FALLBACK_COURT_IMAGE,
    sports: [
      { key: 'futbol', label: 'Fútbol' },
      { key: 'basket', label: 'Basket' },
    ],
    distanceKm: 1.2,
    distanceLabel: 'A 1.2 KM',
    pricePerHour: 120000,
    priceLabel: '$120.000 COP',
    capacity: 14,
    sportId: 1,
  },
  {
    id: 'space-2',
    venueId: 'venue-2',
    name: 'Arena Salitre',
    spaceName: 'Cancha 1',
    address: 'Cra. 68 #11-45',
    city: 'Bogotá',
    imageSrc: 'images/field-padel.png',
    sports: [
      { key: 'futbol', label: 'Fútbol' },
      { key: 'basket', label: 'Basket' },
    ],
    distanceKm: 3.5,
    distanceLabel: 'A 3.5 KM',
    pricePerHour: 95000,
    priceLabel: '$95.000 COP',
    capacity: 12,
    sportId: 1,
  },
  {
    id: 'space-3',
    venueId: 'venue-3',
    name: 'Pádel Center 93',
    spaceName: 'Pádel 2',
    address: 'Cl 93 #11-27',
    city: 'Bogotá',
    imageSrc: 'images/field-padel.png',
    sports: [{ key: 'padel', label: 'Pádel' }],
    distanceKm: 5,
    distanceLabel: 'A 5.0 KM',
    pricePerHour: 80000,
    priceLabel: '$80.000 COP',
    capacity: 8,
    sportId: 2,
  },
  {
    id: 'space-4',
    venueId: 'venue-4',
    name: 'Goles y Amigos',
    spaceName: 'Cancha 4',
    address: 'Av. Suba #100-20',
    city: 'Bogotá',
    imageSrc: FALLBACK_COURT_IMAGE,
    sports: [{ key: 'futbol', label: 'Fútbol' }],
    distanceKm: 8.2,
    distanceLabel: 'A 8.2 KM',
    pricePerHour: 70000,
    priceLabel: '$70.000 COP',
    capacity: 10,
    sportId: 1,
  },
];

/**
 * Franjas horarias quemadas: siempre hay contenido para que el paso 2
 * tenga algo que mostrar aunque la API no responda.
 */
export const FALLBACK_SLOTS: TimeSlotOption[] = [
  { value: '16:00', endTime: '17:00', label: '16:00 - 17:00', available: true, price: null },
  { value: '17:00', endTime: '18:00', label: '17:00 - 18:00', available: true, price: null },
  { value: '18:00', endTime: '19:00', label: '18:00 - 19:00', available: true, price: null },
  { value: '19:00', endTime: '20:00', label: '19:00 - 20:00', available: true, price: null },
  { value: '20:00', endTime: '21:00', label: '20:00 - 21:00', available: true, price: null },
];
