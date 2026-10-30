import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FinancePeriod } from '@canchalibre/shared-domain';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { SubnavComponent } from '../../components/subnav/subnav.component';
import { OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { MediaQueryService } from '../../services/media-query.service';
import {
  FALLBACK_FINANCE,
  FINANCE_PERIODS,
  FILTER_LABEL,
  RECENT_TRANSACTIONS_LABEL,
  TOTAL_DEPOSITS_LABEL,
} from './constants/finanzas.constants';
import { FinanzasService } from './services/finanzas.service';

/**
 * Pagos y anticipos del propietario.
 */
@Component({
  selector: 'cl-finanzas-page',
  imports: [AppMenuComponent, SubnavComponent],
  templateUrl: './finanzas.page.html',
  styleUrl: './finanzas.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanzasPage {
  private readonly finanzasService = inject(FinanzasService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems = OWNER_NAV_ITEMS;

  protected readonly periods = FINANCE_PERIODS;
  protected readonly totalLabel = TOTAL_DEPOSITS_LABEL;
  protected readonly recentLabel = RECENT_TRANSACTIONS_LABEL;
  protected readonly filterLabel = FILTER_LABEL;

  protected readonly subnavItems = [
    { value: 'agenda', label: 'Agenda', icon: 'pi pi-calendar' },
    { value: 'reservas', label: 'Reservas', icon: 'pi pi-list' },
    { value: 'disponibilidad', label: 'Disponibilidad', icon: 'pi pi-th-large' },
    { value: 'pagos', label: 'Pagos', icon: 'pi pi-wallet' },
  ];

  protected readonly activeSection = signal('pagos');
  protected readonly period = signal<FinancePeriod>('day');

  protected readonly summary = signal(FALLBACK_FINANCE);

  /** Movimientos visibles (los del fallback si la API no trae). */
  protected readonly transactions = computed(() => {
    const items = this.summary().transactions;

    return items.length > 0 ? items : FALLBACK_FINANCE.transactions;
  });

  constructor() {
    this.load('day');
  }

  protected onSectionChange(value: string): void {
    this.activeSection.set(value);

    const routes: Record<string, string> = {
      agenda: '/agenda',
      reservas: '/agenda/reservas',
      disponibilidad: '/agenda/disponibilidad',
      pagos: '/agenda/pagos',
    };

    void this.router.navigateByUrl(routes[value] ?? '/agenda');
  }

  /** Cambia el periodo del resumen. */
  protected onPeriodChange(value: string): void {
    const period = value as FinancePeriod;

    this.period.set(period);
    this.load(period);
  }

  /** Carga el resumen del periodo. */
  private load(period: FinancePeriod): void {
    this.finanzasService.getSummary(period).subscribe((summary) => this.summary.set(summary));
  }
}
