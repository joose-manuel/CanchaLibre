/**
 * Tipos de la página "Registrar Cancha".
 *
 * Son "view models" de la web: aíslan a la página del contrato del backend.
 * El `RegistrarCanchaService` es el único que conoce la API y traduce a
 * estas interfaces.
 */

import { BalanceMethod, SpaceType } from '@canchalibre/shared-domain';

/** Pasos del asistente. */
export type RegistroStep = 1 | 2 | 3;

/** Un deporte disponible en la plataforma. */
export interface SportOption {
  id: number;
  name: string;
  /** Icono de PrimeIcons. */
  icon: string;
}

/** Una ciudad donde se puede registrar la sede. */
export interface CityOption {
  id: string;
  name: string;
}

/** Datos del paso 1: información básica de la sede. */
export interface VenueBasicInfo {
  name: string;
  cityId: string;
  address: string;
  phone: string;
  /** Ids de los deportes que ofrece la sede. */
  sportIds: number[];
}

/** Un espacio (cancha) dentro de la sede. */
export interface SpaceDraft {
  id: string;
  name: string;
  capacity: number;
  type: SpaceType;
  /** Ids de los deportes permitidos en este espacio. */
  sportIds: number[];
  /** Icono según el deporte principal. */
  icon: string;
  /** "Fútbol • Cap. 10 pers." */
  summary: string;
}

/** Datos del paso 3: políticas y pagos. */
export interface VenuePolicies {
  /** Anticipo en porcentaje (0 - 100). */
  depositPercent: number;
  /** El anticipo es un valor fijo en pesos (en vez de porcentaje). */
  depositFixed: boolean;
  /** Valor fijo del anticipo cuando `depositFixed` es `true`. */
  depositAmount: number;
  /** Ventana de cancelación en horas. */
  cancelWindowHours: number;
  /** Dónde se paga el saldo restante. */
  balanceMethod: BalanceMethod;
}

/** Vista de una sede propia, para la lista "Mis Canchas". */
export interface OwnedVenueView {
  id: string;
  name: string;
  address: string;
  city: string;
  imageSrc: string;
  /** Nombres de los deportes que ofrece. */
  sports: string[];
  /** Número de espacios de la sede. */
  spaceCount: number;
  /** "Anticipo 30%" */
  depositLabel: string;
  /** "En la aplicación" / "En el establecimiento" */
  balanceLabel: string;
}
