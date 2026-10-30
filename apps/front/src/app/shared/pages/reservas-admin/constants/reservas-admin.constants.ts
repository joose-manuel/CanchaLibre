import { BookingStatus } from '@canchalibre/shared-domain';
import { AdminReservation } from '../../../interfaces/owner.interface';

/**
 * Datos quemados de la lista de reservas del propietario.
 *
 * Sólo se usan como fallback cuando la API no responde.
 */

export const FALLBACK_RESERVATIONS: AdminReservation[] = [
  {
    id: 'r-1',
    customerName: 'Alejandro García',
    codeLabel: 'ID: #BK-8821',
    status: BookingStatus.Confirmed,
    statusLabel: 'CONFIRMADA',
    statusTone: 'confirmed',
    dateLabel: '24 May, 2024',
    timeLabel: '2:30 PM',
    detailLabel: '2 personas • Premium Pack',
    priceLabel: '$120.00',
  },
  {
    id: 'r-2',
    customerName: 'Elena Rodríguez',
    codeLabel: 'ID: #BK-8822',
    status: BookingStatus.Pending,
    statusLabel: 'PENDIENTE',
    statusTone: 'pending',
    dateLabel: 'Hoy',
    timeLabel: '6:00 PM',
    detailLabel: '4 personas • Cena Maridaje',
    priceLabel: '$340.00',
  },
  {
    id: 'r-3',
    customerName: 'Marco Tulio',
    codeLabel: 'ID: #BK-8819',
    status: BookingStatus.Cancelled,
    statusLabel: 'CANCELADA',
    statusTone: 'cancelled',
    dateLabel: '25 May, 2024',
    timeLabel: '12:00 PM',
    detailLabel: '6 personas • Evento Privado',
    priceLabel: '$560.00',
  },
];

/** Filtros de la lista de reservas. */
export const RESERVATION_FILTERS: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
];

/** Etiqueta de la sección de la lista. */
export const RECENT_RESERVATIONS_LABEL = 'RESERVAS RECIENTES';

/** Acción del historial. */
export const HISTORY_LABEL = 'Ver histórico';

/** Placeholder del buscador. */
export const SEARCH_PLACEHOLDER = 'Buscar por nombre o ID de reserva...';
