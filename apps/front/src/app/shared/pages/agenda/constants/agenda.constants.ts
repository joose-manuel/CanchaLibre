import { AgendaEntry } from '../../../interfaces/owner.interface';

/**
 * Datos quemados de la agenda del propietario.
 *
 * Sólo se usan como fallback cuando la API no responde. Reproducen el
 * escenario del diseño: un día con reservas confirmadas, una pendiente de
 * confirmar, un bloqueo y una reserva cancelada.
 */

/** Agenda quemada de un día. */
export const FALLBACK_AGENDA: AgendaEntry[] = [
  {
    id: 'ag-1',
    code: 'CL-4821',
    title: 'Cancha 3 - Padel',
    organizerName: 'Juan Pérez',
    timeLabel: '10:00',
    durationLabel: '60 min',
    rangeLabel: '10:00 AM - 11:00 AM',
    status: 'confirmed',
    statusLabel: 'CONFIRMADA',
    statusNote: 'Pagado',
    depositAmount: 150000,
    actionable: false,
    isBlock: false,
  },
  {
    id: 'ag-2',
    code: 'CL-4822',
    title: 'Cancha 1 - Tenis',
    organizerName: 'Marta Gomez',
    timeLabel: '11:30',
    durationLabel: '60 min',
    rangeLabel: '11:30 AM - 12:30 PM',
    status: 'pending',
    statusLabel: 'PENDIENTE',
    statusNote: 'Falta confirmar',
    depositAmount: 85000,
    actionable: true,
    isBlock: false,
  },
  {
    id: 'ag-3',
    code: 'CL-4823',
    title: 'Cancha 2 - Mantenimiento',
    organizerName: 'Bloqueado por Admin',
    timeLabel: '13:00',
    durationLabel: '120 min',
    rangeLabel: '1:00 PM - 3:00 PM',
    status: 'blocked',
    statusLabel: 'BLOQUEADO',
    statusNote: 'Bloqueado por Admin',
    depositAmount: 0,
    actionable: false,
    isBlock: true,
  },
  {
    id: 'ag-4',
    code: 'CL-4824',
    title: 'Cancha 4 - Padel',
    organizerName: 'Carlos Ruiz',
    timeLabel: '15:30',
    durationLabel: '60 min',
    rangeLabel: '3:30 PM - 4:30 PM',
    status: 'cancelled',
    statusLabel: 'CANCELADA',
    statusNote: 'Cancelada',
    depositAmount: 0,
    actionable: false,
    isBlock: false,
  },
];

/** Segmentos del selector de día. */
export const AGENDA_DAY_TABS: { value: 'today' | 'tomorrow' | 'calendar'; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'calendar', label: 'Calendario' },
];

/** Etiqueta de la sección del cronograma. */
export const SCHEDULE_TITLE = 'Cronograma del día';

/** Texto de la acción de bloquear un horario. */
export const BLOCK_SLOT_LABEL = 'Bloquear horario';

/** Formato de moneda de la cabecera: "$150k". */
export function toCompactCop(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }

  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}k`;
  }

  return `$${amount}`;
}
