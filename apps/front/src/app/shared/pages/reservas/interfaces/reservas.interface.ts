/**
 * Tipos de la vista de reservas.
 *
 * Son "view models" de la web: aíslan a la página del contrato del backend.
 * El `ReservasService` es el único que conoce la API y traduce a estas
 * interfaces.
 */

import { BookingStatus } from '@canchalibre/shared-domain';

export type BookingStatusKey = BookingStatus;

export type BookingStatusTone = 'confirmed' | 'planned' | 'pending' | 'paid' | 'cancelled';

export interface BookingParticipant {
  id: string;
  avatarUrl: string;
  name: string;
}

/** Una reserva del usuario, lista para pintar. */
export interface BookingView {
  id: string;
  code: string;
  venueName: string;
  spaceName: string | null;
  sportLabel: string;
  /** Fecha cruda `yyyy-mm-dd`, para filtrar por día y ordenar. */
  matchDate: string;
  /** "Hoy, 23 Oct" */
  dateLabel: string;
  /** "6:00 PM" */
  timeLabel: string;
  status: BookingStatusKey;
  statusLabel: string;
  statusTone: BookingStatusTone;
  imageSrc: string;
  /** "$15.000 COP" */
  priceLabel: string | null;
  /** "Pago dividido" */
  priceCaption: string | null;
  participants: BookingParticipant[];
  /** Jugadores que aún faltan por confirmada. */
  missingPlayers: number;
  /** Progreso de cupos (0 - 100). */
  fillPercent: number;
  /** Si la reserva se puede gestionar (cancelar / editar). */
  manageable: boolean;
}

/** Un día del selector horizontal. */
export interface BookingDay {
  /** Clave `yyyy-mm-dd`. */
  key: string;
  /** "LUN" */
  weekday: string;
  /** "23" */
  dayNumber: string;
  isToday: boolean;
  isSelected: boolean;
}

/** Opción del control segmentado. */
export interface BookingSegment {
  value: string;
  label: string;
}

export type BookingSegmentValue = 'upcoming' | 'past';
