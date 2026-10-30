import { FinancePeriod } from '@canchalibre/shared-domain';
import { OwnerFinanceSummary } from '@canchalibre/shared-domain';
import { FinanceSummary } from '../../../interfaces/owner.interface';

/**
 * Datos quemados de la pantalla de pagos y anticipos.
 *
 * Sólo se usan como fallback cuando la API no responde.
 */

export const FALLBACK_SUMMARY: OwnerFinanceSummary = {
  period: 'day',
  from: '',
  to: '',
  totalDeposits: 1240,
  totalPaid: 1240,
  pending: 0,
  payments: [],
};

/** Resumen quemado con los movimientos del diseño. */
export const FALLBACK_FINANCE: FinanceSummary = {
  period: 'day',
  totalDepositsLabel: '$1,240.00',
  trendLabel: '+12% vs yesterday',
  transactions: [
    {
      id: 'tx-1',
      code: '#BK-8821',
      dateLabel: 'Oct 24, 10:30 AM',
      title: 'Main Hall Booking',
      amountLabel: '+$150.00',
      kindLabel: 'Deposit',
      tone: 'paid',
      statusLabel: 'PAGADA',
    },
    {
      id: 'tx-2',
      code: '#BK-8819',
      dateLabel: 'Oct 24, 09:15 AM',
      title: 'Conference Room B',
      amountLabel: '+$85.00',
      kindLabel: 'Deposit',
      tone: 'pending',
      statusLabel: 'PENDIENTE',
    },
    {
      id: 'tx-3',
      code: '#BK-8790',
      dateLabel: 'Oct 23, 04:45 PM',
      title: 'Wedding Photoroom',
      amountLabel: '-$200.00',
      kindLabel: 'Cancellation',
      tone: 'refunded',
      statusLabel: 'REEMBOLSADA',
    },
    {
      id: 'tx-4',
      code: '#BK-8755',
      dateLabel: 'Oct 23, 02:20 PM',
      title: 'Volleyball Cancha',
      amountLabel: '+$320.00',
      kindLabel: 'Deposit',
      tone: 'paid',
      statusLabel: 'PAGADA',
    },
  ],
};

/** Periodos del resumen. */
export const FINANCE_PERIODS: { value: FinancePeriod; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/** Título de la tarjeta de totales. */
export const TOTAL_DEPOSITS_LABEL = 'TOTAL DEPOSITS';

/** Etiqueta de la lista de movimientos. */
export const RECENT_TRANSACTIONS_LABEL = 'Recent Transactions';

/** Etiqueta del filtro. */
export const FILTER_LABEL = 'Filter';
