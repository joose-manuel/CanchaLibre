import { BalanceMethod, SpaceType } from '@canchalibre/shared-domain';
import { SportIconKey } from '../../../components/sport-icon/sport-icon.component';
import {
  CityOption,
  SpaceDraft,
  SportOption,
  VenuePolicies,
} from '../interfaces/registrar-cancha.interface';

/**
 * Datos quemados del asistente de registro.
 *
 * Las ciudades y los deportes sí existen en el backend, así que se piden
 * por el `RegistrarCanchaService`. Lo que sí es del producto (opciones de
 * tipo de espacio, ventanas de cancelación, textos) vive aquí.
 */

/** Prefijo internacional del teléfono. */
export const PHONE_PREFIX = '+57';

/** Tipos de espacio ofrecidos. */
export const SPACE_TYPES: { value: SpaceType; label: string }[] = [
  { value: SpaceType.Indoor, label: 'Interior' },
  { value: SpaceType.Outdoor, label: 'Exterior' },
];

/** Ventanas de cancelación ofrecidas (en horas). */
export const CANCEL_WINDOWS: { value: number; label: string }[] = [
  { value: 6, label: '6 horas antes' },
  { value: 12, label: '12 horas antes' },
  { value: 24, label: '24 horas antes' },
  { value: 48, label: '48 horas antes' },
  { value: 72, label: '3 días antes' },
];

/** Opciones de la forma de calcular el anticipo. */
export const DEPOSIT_MODES: { value: 'percent' | 'fixed'; label: string }[] = [
  { value: 'percent', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Valor Fijo ($)' },
];

/** Métodos de pago del saldo restante. */
export const BALANCE_METHODS: {
  value: BalanceMethod;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: BalanceMethod.App,
    title: 'En la Aplicación',
    description: 'Pagos digitales rápidos y seguros',
    icon: 'pi pi-mobile',
  },
  {
    value: BalanceMethod.Venue,
    title: 'En el Establecimiento',
    description: 'Pago presencial al llegar al recinto',
    icon: 'pi pi-building',
  },
];

/** Deportes que ofrece la plataforma, con su icono. */
export const FALLBACK_SPORTS: SportOption[] = [
  { id: 1, name: 'Fútbol', icon: 'pi pi-circle' },
  { id: 2, name: 'Baloncesto', icon: 'pi pi-circle' },
  { id: 3, name: 'Pádel', icon: 'pi pi-circle' },
  { id: 4, name: 'Tenis', icon: 'pi pi-circle' },
  { id: 5, name: 'Voleibol', icon: 'pi pi-circle' },
  { id: 6, name: 'Gimnasio', icon: 'pi pi-bolt' },
];

/**
 * Nombre de deporte -> clave del icono vectorial.
 *
 * La API devuelve los nombres en texto ("Fútbol", "Baloncesto", ...), así
 * que se busca la palabra clave dentro del nombre.
 */
export function toSportIconKey(name: string): SportIconKey {
  const normalized = name.toLowerCase();

  if (normalized.includes('padel')) {
    return 'padel';
  }

  if (normalized.includes('basket') || normalized.includes('balonces')) {
    return 'basket';
  }

  if (normalized.includes('tenis')) {
    return 'tenis';
  }

  if (normalized.includes('voley')) {
    return 'voley';
  }

  if (normalized.includes('gimnas')) {
    return 'gimnasio';
  }

  return 'futbol';
}

/** Ciudades de fallback (si la API no responde). */
export const FALLBACK_CITIES: CityOption[] = [
  { id: 'city-bogota', name: 'Bogotá' },
  { id: 'city-medellin', name: 'Medellín' },
  { id: 'city-cali', name: 'Cali' },
  { id: 'city-barranquilla', name: 'Barranquilla' },
];

/** Texto auxiliar del paso 1. */
export const STEP_1_HINT =
  'Completa los datos iniciales para empezar a configurar tu sede y recibir reservas en línea.';

/** Texto auxiliar del paso 2. */
export const STEP_2_HINT =
  'Agrega los detalles de cada una de tus canchas o espacios disponibles para reserva.';

/** Nota al pie del paso 1. */
export const STEP_1_FOOTNOTE = 'Podrás editar esta información más tarde';

/** Etiqueta de la sección de espacios añadidos. */
export const ADDED_SPACES_LABEL = 'ESPACIOS AÑADIDOS';

/** Título de la pantalla. */
export const PAGE_TITLE = 'Registra tu sede';

/** Política inicial (valores por defecto del formulario). */
export const DEFAULT_POLICIES: VenuePolicies = {
  depositPercent: 20,
  depositFixed: false,
  depositAmount: 50000,
  cancelWindowHours: 24,
  balanceMethod: BalanceMethod.App,
};

/** Espacio inicial vacío del paso 2. */
export function emptySpace(index: number): SpaceDraft {
  return {
    id: `space-${index}`,
    name: '',
    capacity: 10,
    type: SpaceType.Indoor,
    sportIds: [],
    icon: 'pi pi-th-large',
    summary: '',
  };
}
