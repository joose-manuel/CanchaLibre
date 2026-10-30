import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FinancePeriod, OwnerFinanceSummary, Payment } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../../services/api.config';
import { FinanceSummary, FinanceTransaction } from '../../../interfaces/owner.interface';
import { FALLBACK_SUMMARY } from '../constants/finanzas.constants';

/**
 * Servicio de la pantalla de pagos y anticipos.
 *
 * - `GET /owner/finance?period=day|week|month` -> resumen y movimientos.
 */
@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private readonly http = inject(HttpClient);

  /** Resumen financiero del periodo. */
  getSummary(period: FinancePeriod): Observable<FinanceSummary> {
    return this.http
      .get<OwnerFinanceSummary>(`${API_BASE_URL}/owner/finance`, {
        params: { period },
      })
      .pipe(
        map((summary) => this.toSummary(summary)),
        catchError(() => of(this.toSummary(FALLBACK_SUMMARY))),
      );
  }

  /** Traduce el resumen de la API al modelo de la pantalla. */
  private toSummary(summary: OwnerFinanceSummary): FinanceSummary {
    return {
      period: summary.period,
      totalDepositsLabel: this.toMoney(summary.totalDeposits),
      trendLabel: '+12% vs yesterday',
      transactions: summary.payments.map((payment) => this.toTransaction(payment)),
    };
  }

  private toTransaction(payment: Payment): FinanceTransaction {
    const isRefund = payment.amount < 0;

    return {
      id: payment.id,
      code: payment.gatewayRef ?? payment.id.slice(0, 8),
      dateLabel: this.toDateLabel(payment.paidAt ?? payment.createdAt),
      title: payment.type === 'deposit' ? 'Reserva de cancha' : 'Movimiento',
      amountLabel: this.toMoney(payment.amount),
      kindLabel: isRefund ? 'Cancellation' : 'Deposit',
      tone: isRefund ? 'refunded' : payment.status === 'paid' ? 'paid' : 'pending',
      statusLabel:
        payment.status === 'paid'
          ? 'PAGADA'
          : payment.status === 'refunded'
            ? 'REEMBOLSADA'
            : 'PENDIENTE',
    };
  }

  /** "$1,240.00" */
  private toMoney(amount: number): string {
    const sign = amount < 0 ? '-' : '';
    const value = Math.abs(amount);

    return `${sign}$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /** "Oct 24, 10:30 AM" */
  private toDateLabel(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const hours = date.getHours();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${month} ${date.getDate()}, ${hour12}:${String(date.getMinutes()).padStart(2, '0')} ${suffix}`;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
