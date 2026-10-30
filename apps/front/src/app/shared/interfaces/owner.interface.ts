/**
 * Tipos de la sección de propietario (agenda, reservas, disponibilidad y
 * pagos).
 *
 * Son "view models" de la web: aíslan a las páginas del contrato del
 * backend. Cada servicio traduce la respuesta de la API a estos tipos.
 */

import { BookingStatus, FinancePeriod } from '@canchalibre/shared-domain';

/** Estados posibles de una reserva en la agenda del propietario. */
export type AgendaStatus = 'confirmed' | 'pending' | 'blocked' | 'cancelled';

/** Una reserva dentro del cronograma del día. */
export interface AgendaEntry {
  id: string;
  /** "CL-4821" */
  code: string;
  /** "Cancha 3 - Padel" */
  title: string;
  /** "Juan Pérez" */
  organizerName: string;
  /** "10:00" */
  timeLabel: string;
  /** "60 min" */
  durationLabel: string;
  /** "08:00 - 09:00" */
  rangeLabel: string;
  status: AgendaStatus;
  /** Etiqueta legible del estado ("CONFIRMADA"). */
  statusLabel: string;
  /** Nota secundaria ("Pagado", "Falta confirmar"). */
  statusNote: string;
  /** Anticipo cobrado de la reserva (0 si no aplica). */
  depositAmount: number;
  /** Si el propietario puede confirmar / rechazar la reserva. */
  actionable: boolean;
  /** Bloqueo creado por el propietario (no es una reserva). */
  isBlock: boolean;
}

/** Métricas de la cabecera de la agenda. */
export interface AgendaStats {
  /** Número de reservas del día. */
  reservations: number;
  /** Suma de los anticipos del día. */
  deposits: number;
  /** Número de bloqueos del día. */
  blocks: number;
}

/** Una reserva en la lista "Reservas" del propietario. */
export interface AdminReservation {
  id: string;
  /** "Alejandro García" */
  customerName: string;
  /** "ID: #BK-8821" */
  codeLabel: string;
  status: BookingStatus;
  statusLabel: string;
  statusTone: 'confirmed' | 'pending' | 'cancelled' | 'paid';
  /** "24 May, 2024" */
  dateLabel: string;
  /** "14:30 PM" */
  timeLabel: string;
  /** "2 personas • Premium Pack" */
  detailLabel: string;
  /** "$120.00" */
  priceLabel: string;
}

/** Una reserva en detalle (vista del propietario). */
export interface AdminReservationDetail {
  id: string;
  /** "Reserva #12345" */
  title: string;
  status: BookingStatus;
  statusLabel: string;
  /** Etapas: creada, pagada, confirmada. */
  steps: { key: string; label: string; done: boolean }[];
  imageSrc: string;
  /** "Cancha 3 - Padel" */
  courtName: string;
  /** "Club Prodes" */
  venueName: string;
  /** "25 Oct, 2023" */
  dateLabel: string;
  /** "18:00 - 19:30" */
  timeLabel: string;
  /** "90 min" */
  durationLabel: string;
  /** "Partido 2v2" */
  formatLabel: string;
  /** "Juan Pérez" */
  customerName: string;
  /** "+54 9 11 1234-5678" */
  customerPhone: string;
  customerInitials: string;
  /** "$20.00" */
  depositLabel: string;
  /** "$30.00" */
  balanceLabel: string;
  /** "$50.00" */
  totalLabel: string;
  /** Política de cancelación de la sede. */
  policyText: string;
}

/** Una fila de la grilla de disponibilidad. */
export interface AvailabilitySlot {
  /** "08:00" */
  time: string;
  /** Reserva o bloqueo que ocupa el hueco (si lo hay). */
  entry: {
    id: string;
    label: string;
    tone: 'confirmed' | 'pending' | 'blocked';
  } | null;
}

/** Un bloque de la grilla: un día de la semana. */
export interface AvailabilityDay {
  /** "LUN" */
  weekday: string;
  /** "23" */
  dayNumber: string;
  isToday: boolean;
  /** Reservas + bloqueos de ese día. */
  slots: AvailabilitySlot[];
}

/** Transacción de la pantalla de pagos. */
export interface FinanceTransaction {
  id: string;
  /** "#BK-8821" */
  code: string;
  /** "Oct 24, 10:30 AM" */
  dateLabel: string;
  /** "Main Hall Booking" */
  title: string;
  /** "+$150.00" */
  amountLabel: string;
  /** "Deposit" / "Cancellation" */
  kindLabel: string;
  tone: 'paid' | 'pending' | 'refunded';
  statusLabel: string;
}

/** Resumen financiero de un periodo. */
export interface FinanceSummary {
  period: FinancePeriod;
  /** "$1,240.00" */
  totalDepositsLabel: string;
  /** "+12% vs yesterday" */
  trendLabel: string;
  transactions: FinanceTransaction[];
}
