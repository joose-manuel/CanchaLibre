/**
 * Tipos de la página "Crear Partido".
 *
 * Son "view models" de la web: aíslan a la página del contrato del backend.
 * El `CrearPartidoService` es el único que conoce la API y traduce a estas
 * interfaces.
 */

import { MatchFormat } from '@canchalibre/shared-domain';

/** Pasos del asistente de creación. */
export type CreateStep = 1 | 2 | 3 | 4;

/** Deportes que puede tener una cancha. */
export type CourtSportKey = 'futbol' | 'padel' | 'basket';

/** Un deporte offered por una cancha. */
export interface CourtSport {
  key: CourtSportKey;
  label: string;
}

/**
 * Una cancha seleccionable (step 1).
 *
 * `id` es el `spaceId` de la API: es lo que se envía al crear el partido.
 */
export interface CourtOption {
  id: string;
  venueId: string;
  /** "Canchas El Campín" */
  name: string;
  /** "Cancha Sintética 3" */
  spaceName: string;
  address: string;
  city: string;
  imageSrc: string;
  sports: CourtSport[];
  /** Distancia en km (null si la API no la calcula). */
  distanceKm: number | null;
  /** "A 1.2 KM" */
  distanceLabel: string;
  pricePerHour: number;
  /** "$60.000 COP" */
  priceLabel: string;
  /** Cupo máximo del espacio. */
  capacity: number;
  /** Deporte principal (el primero de la lista de la API). */
  sportId: number;
}

/** Una franja horaria disponible (step 2). */
export interface TimeSlotOption {
  /** "18:00" */
  value: string;
  /** "19:00" */
  endTime: string;
  /** "18:00 - 19:00" */
  label: string;
  available: boolean;
  /** Precio de la franja, si la API lo informa. */
  price: number | null;
}

/** Un formato de juego (step 2). */
export interface FormatOption {
  value: MatchFormat;
  /** "5 v 5" */
  label: string;
  /** "10 Jugadores" */
  playersLabel: string;
  /** Cupo que impone el formato. */
  capacity: number;
}

/** Una línea del desglose de precio. */
export interface PriceLine {
  label: string;
  /** "$120.000 COP" */
  value: string;
  /** Texto auxiliar (ej. "1 Hora"). */
  caption?: string;
  /** Destaca la línea (total a pagar). */
  emphasis?: boolean;
}

/** Datos enviados al backend para crear el partido. */
export interface CreateMatchDraft {
  spaceId: string;
  sportId: number;
  /** "yyyy-mm-dd" */
  matchDate: string;
  /** "18:00" */
  startTime: string;
  /** "19:00" */
  endTime: string;
  format: MatchFormat;
  capacity: number;
  priceTotal: number;
}

/** Resultado de crear el partido (y su reserva). */
export interface CreatedMatch {
  matchId: string;
  bookingId: string;
  /** "CL-4821" */
  code: string;
  /** Contenido del QR de acceso a la cancha. */
  qrPayload: string;
}
