import { BookingStatus } from '@canchalibre/shared-domain';
import { AdminReservationDetail } from '../../../interfaces/owner.interface';

/**
 * Datos quemados del detalle de una reserva.
 *
 * Sólo se usan como fallback cuando la API no responde.
 */

export const FALLBACK_DETAIL: AdminReservationDetail = {
  id: 'r-2',
  title: 'Reserva #12345',
  status: BookingStatus.Pending,
  statusLabel: 'PENDIENTE',
  steps: [],
  imageSrc: 'images/field-padel.png',
  courtName: 'Cancha 3 - Padel',
  venueName: 'Club Prodes',
  dateLabel: '25 Oct, 2023',
  timeLabel: '18:00 - 19:30',
  durationLabel: '90 min',
  formatLabel: 'Partido 2v2',
  customerName: 'Juan Pérez',
  customerPhone: '+54 9 11 1234-5678',
  customerInitials: 'JP',
  depositLabel: '$20.00',
  balanceLabel: '$30.00',
  totalLabel: '$50.00',
  policyText:
    'Política de cancelación: Cancelaciones hasta 24 horas antes del turno. En caso de cancelación tardía, el anticipo no será reembolsado.',
};

/** Etiqueta de la sección del cliente. */
export const CLIENT_INFO_LABEL = 'INFORMACIÓN DEL CLIENTE';

/** Etiqueta de la sección del pago. */
export const PAYMENT_STATUS_LABEL = 'ESTADO DE PAGO';

/** Etiqueta del anticipo. */
export const DEPOSIT_LABEL = 'Anticipo (Online)';

/** Etiqueta del saldo. */
export const BALANCE_LABEL = 'Saldo (En el club)';

/** Etiqueta del total. */
export const TOTAL_LABEL = 'Total de la reserva';

/** Acción de cancelar. */
export const CANCEL_LABEL = 'Cancelar';

/** Acción de no-show. */
export const NO_SHOW_LABEL = 'No-show';

/** Etiqueta de la acción de contactar por WhatsApp. */
export const WHATSAPP_LABEL = 'Contactar por WhatsApp';
