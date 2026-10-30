import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStatus } from '@canchalibre/shared-domain';
import { BookingStepperComponent } from '../../components/booking-stepper/booking-stepper.component';
import { OWNER_NAV_ITEMS } from '../../constants/nav-items';
import { AdminReservationDetail } from '../../interfaces/owner.interface';
import { MediaQueryService } from '../../services/media-query.service';
import { FALLBACK_DETAIL } from './constants/reserva-detalle.constants';
import { ReservasAdminService } from '../reservas-admin/services/reservas-admin.service';

/**
 * Detalle de una reserva (vista del propietario).
 *
 * Permite revisar el cliente, el estado del pago y actuar sobre la reserva
 * (cancelar o registrar un no-show).
 */
@Component({
  selector: 'cl-reserva-detalle-page',
  imports: [BookingStepperComponent],
  templateUrl: './reserva-detalle.page.html',
  styleUrl: './reserva-detalle.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaDetallePage {
  private readonly reservasAdminService = inject(ReservasAdminService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);

  /** Id de la reserva a mostrar (query param `reserva`). */
  readonly reserva = input<string>();

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems = OWNER_NAV_ITEMS;

  protected readonly detail = signal<AdminReservationDetail>(FALLBACK_DETAIL);

  /** Etapas del stepper, derivadas del estado de la reserva. */
  protected readonly steps = computed(() => {
    const status = this.detail().status;

    const created = true;
    const paid = status !== BookingStatus.Pending;
    const confirmed =
      status === BookingStatus.Confirmed || status === BookingStatus.Paid;

    return [
      { key: 'created', label: 'CREADA', done: created },
      { key: 'paid', label: 'PAGADA', done: paid },
      { key: 'confirmed', label: 'CONFIRMADA', done: confirmed },
    ];
  });

  constructor() {
    this.reservasAdminService.getReservations().subscribe((reservations) => {
      const id = this.reserva();

      if (!id) {
        return;
      }

      const found = reservations.find((reservation) => reservation.id === id);

      if (found) {
        this.detail.update((detail) => ({
          ...detail,
          id: found.id,
          title: `Reserva #${found.codeLabel.replace('#', '')}`,
          status: found.status,
          statusLabel: found.statusLabel,
          customerName: found.customerName,
          dateLabel: found.dateLabel,
          timeLabel: found.timeLabel,
          totalLabel: found.priceLabel,
        }));
      }
    });
  }

  /** Vuelve a la lista de reservas. */
  protected goBack(): void {
    void this.router.navigateByUrl('/agenda/reservas');
  }

  /** Cancela la reserva. */
  protected onCancel(): void {
    this.reservasAdminService.reject(this.detail().id).subscribe(() => {
      this.detail.update((detail) => ({
        ...detail,
        status: BookingStatus.Cancelled,
        statusLabel: 'CANCELADA',
      }));
    });
  }

  /** Registra un no-show. */
  protected onNoShow(): void {
    this.reservasAdminService.noShow(this.detail().id).subscribe(() => {
      this.detail.update((detail) => ({
        ...detail,
        status: BookingStatus.NoShow,
        statusLabel: 'NO ASISTIÓ',
      }));
    });
  }
}
