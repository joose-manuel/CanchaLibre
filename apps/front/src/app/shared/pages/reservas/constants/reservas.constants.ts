import { BookingStatus } from '@canchalibre/shared-domain';
import {
  BookingSegment,
  BookingView,
} from '../interfaces/reservas.interface';

/**
 * Datos quemados de la página de reservas.
 *
 * Sólo se usan como fallback cuando la API no responde. Todo lo que existe
 * en el backend se pide por el `ReservasService`.
 */

/** Segmentos del control superior. */
export const BOOKING_SEGMENTS: BookingSegment[] = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Anteriores' },
];

/** Etiquetas legibles para el estado de una reserva. */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'PENDIENTE',
  [BookingStatus.Paid]: 'PAGADA',
  [BookingStatus.Confirmed]: 'CONFIRMADA',
  [BookingStatus.Cancelled]: 'CANCELADA',
  [BookingStatus.Rejected]: 'RECHAZADA',
  [BookingStatus.NoShow]: 'NO ASISTIÓ',
};

/** Imagen usada cuando la reserva no tiene portada. */
export const FALLBACK_BOOKING_IMAGE = 'images/field-grass.png';

/** Avatares de ejemplo para la lista de participantes. */
export const FALLBACK_PARTICIPANT_AVATAR = 'images/avatar-carlos.png';

/**
 * Fecha `yyyy-mm-dd` a N días desde hoy. Las reservas quemadas son relativas
 * a la fecha actual para que el filtro "Próximas / Anteriores" las ubique
 * siempre donde corresponde.
 */
function dayFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Etiqueta de fecha legible a N días desde hoy: "Hoy, 23 Oct". */
function labelFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const month = date
    .toLocaleDateString('es-CO', { month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const day = date.getDate();

  if (days === 0) {
    return `Hoy, ${day} ${month}`;
  }

  if (days === -1) {
    return `Ayer, ${day} ${month}`;
  }

  const weekday = date
    .toLocaleDateString('es-CO', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase();

  return `${weekday}, ${day} ${month}`;
}

/** Reserva quemada: se usa cuando `GET /bookings/mine` no está disponible. */
export const FALLBACK_BOOKINGS: BookingView[] = [
  {
    id: 'b-1',
    code: 'CL-4821',
    venueName: 'El Retiro',
    spaceName: 'Cancha 1',
    sportLabel: 'Fútbol 5',
    matchDate: dayFromToday(0),
    dateLabel: labelFromToday(0),
    timeLabel: '6:00 PM',
    status: BookingStatus.Confirmed,
    statusLabel: BOOKING_STATUS_LABELS[BookingStatus.Confirmed],
    statusTone: 'confirmed',
    imageSrc: FALLBACK_BOOKING_IMAGE,
    priceLabel: null,
    priceCaption: null,
    participants: [],
    missingPlayers: 0,
    fillPercent: 100,
    manageable: true,
  },
  {
    id: 'b-2',
    code: 'CL-4830',
    venueName: 'Baloncesto Mixto',
    spaceName: null,
    sportLabel: 'Baloncesto',
    matchDate: dayFromToday(4),
    dateLabel: labelFromToday(4),
    timeLabel: '8:00 PM',
    status: BookingStatus.Pending,
    statusLabel: 'PLANEADA',
    statusTone: 'planned',
    imageSrc: 'images/field-padel.png',
    priceLabel: null,
    priceCaption: null,
    participants: [],
    missingPlayers: 2,
    fillPercent: 60,
    manageable: false,
  },
  {
    id: 'b-3',
    code: 'CL-4844',
    venueName: 'Club Campestre',
    spaceName: null,
    sportLabel: 'Pádel',
    matchDate: dayFromToday(5),
    dateLabel: labelFromToday(5),
    timeLabel: '10:00 AM',
    status: BookingStatus.Confirmed,
    statusLabel: BOOKING_STATUS_LABELS[BookingStatus.Confirmed],
    statusTone: 'confirmed',
    imageSrc: 'images/field-padel.png',
    priceLabel: '$15.000 COP',
    priceCaption: 'Pago dividido',
    participants: [],
    missingPlayers: 0,
    fillPercent: 80,
    manageable: true,
  },
  {
    id: 'b-4',
    code: 'CL-4790',
    venueName: 'Polideportivo Norte',
    spaceName: null,
    sportLabel: 'Fútbol 5',
    matchDate: dayFromToday(-6),
    dateLabel: labelFromToday(-6),
    timeLabel: '7:00 PM',
    status: BookingStatus.Confirmed,
    statusLabel: BOOKING_STATUS_LABELS[BookingStatus.Confirmed],
    statusTone: 'confirmed',
    imageSrc: FALLBACK_BOOKING_IMAGE,
    priceLabel: null,
    priceCaption: null,
    participants: [],
    missingPlayers: 0,
    fillPercent: 100,
    manageable: false,
  },
];
