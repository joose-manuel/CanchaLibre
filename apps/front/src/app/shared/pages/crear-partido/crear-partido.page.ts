import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingTicketComponent } from '../../components/booking-ticket/booking-ticket.component';
import { CapacityStepperComponent } from '../../components/capacity-stepper/capacity-stepper.component';
import { CourtOptionComponent } from '../../components/court-option/court-option.component';
import { FormatOptionComponent } from '../../components/format-option/format-option.component';
import { InfoRowComponent } from '../../components/info-row/info-row.component';
import { MatchHeroComponent } from '../../components/match-hero/match-hero.component';
import { PaymentBreakdownComponent } from '../../components/payment-breakdown/payment-breakdown.component';
import { PricePanelComponent } from '../../components/price-panel/price-panel.component';
import { QrCodeComponent } from '../../components/qr-code/qr-code.component';
import { SearchFieldComponent } from '../../components/search-field/search-field.component';
import { StepHeaderComponent } from '../../components/step-header/step-header.component';
import { TimeSlotsComponent } from '../../components/time-slots/time-slots.component';
import { VenueSummaryComponent } from '../../components/venue-summary/venue-summary.component';
import {
  CANCELLATION_POLICY,
  CREATE_AND_PAY_LABEL,
  CREATE_ONLY_LABEL,
  COURT_SEARCH_HINT,
  DEPOSIT_PERCENT,
  MATCH_FORMATS,
  SERVICE_FEE_PER_PLAYER,
  dayFromToday,
  toCop,
} from './constants/crear-partido.constants';
import {
  CourtOption,
  CreateStep,
  CreatedMatch,
  FormatOption,
  PriceLine,
  TimeSlotOption,
} from './interfaces/crear-partido.interface';
import { CrearPartidoService } from './services/crear-partido.service';

/** Total de pasos del asistente. */
const TOTAL_STEPS = 4;

/** Duración por defecto de un partido (en horas). */
const MATCH_DURATION_HOURS = 1;

@Component({
  selector: 'cl-crear-partido-page',
  imports: [
    BookingTicketComponent,
    CapacityStepperComponent,
    CourtOptionComponent,
    FormatOptionComponent,
    InfoRowComponent,
    MatchHeroComponent,
    PaymentBreakdownComponent,
    PricePanelComponent,
    QrCodeComponent,
    SearchFieldComponent,
    StepHeaderComponent,
    TimeSlotsComponent,
    VenueSummaryComponent,
  ],
  templateUrl: './crear-partido.page.html',
  styleUrl: './crear-partido.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearPartidoPage {
  private readonly crearPartidoService = inject(CrearPartidoService);
  private readonly router = inject(Router);

  /** Paso actual del asistente (1 - 4). */
  protected readonly step = signal<CreateStep>(1);
  protected readonly totalSteps = TOTAL_STEPS;

  /** Canchas disponibles y filtro de búsqueda. */
  protected readonly courts = signal<CourtOption[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedCourt = signal<CourtOption | null>(null);

  /** Configuración del partido (paso 2). */
  protected readonly matchDate = signal(dayFromToday(1));
  protected readonly slots = signal<TimeSlotOption[]>([]);
  protected readonly selectedSlot = signal<string>('');
  protected readonly formats: FormatOption[] = MATCH_FORMATS;
  protected readonly selectedFormat = signal<FormatOption>(MATCH_FORMATS[0]);
  protected readonly capacity = signal(10);

  /** Resultado de la creación (paso 4). */
  protected readonly created = signal<CreatedMatch | null>(null);
  protected readonly pending = signal(false);

  protected readonly cancellationPolicy = CANCELLATION_POLICY;
  protected readonly createAndPayLabel = CREATE_AND_PAY_LABEL;
  protected readonly createOnlyLabel = CREATE_ONLY_LABEL;
  protected readonly searchHint = COURT_SEARCH_HINT;
  protected readonly depositPercent = DEPOSIT_PERCENT;

  /** Canchas que coinciden con el texto buscado. */
  protected readonly visibleCourts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (term === '') {
      return this.courts();
    }

    return this.courts().filter((court) =>
      `${court.name} ${court.spaceName} ${court.address} ${court.city}`
        .toLowerCase()
        .includes(term),
    );
  });

  /** Cancha elegida (para el pie del paso 1). */
  protected readonly court = computed(() => this.selectedCourt());

  /** Etiqueta legible de la fecha elegida. */
  protected readonly dateLabel = computed(() => {
    const date = new Date(`${this.matchDate()}T00:00:00`);

    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  /** Franja horaria elegida. */
  protected readonly slot = computed(
    () => this.slots().find((item) => item.value === this.selectedSlot()) ?? null,
  );

  /** Etiqueta de la franja: "07:00 PM - 08:00 PM". */
  protected readonly timeLabel = computed(() => {
    const slot = this.slot();

    if (!slot) {
      return '';
    }

    return `${this.to12h(slot.value)} - ${this.to12h(slot.endTime)}`;
  });

  /** Precio total de la cancha (por hora x duración). */
  protected readonly rentalTotal = computed(() => {
    const court = this.court();

    if (!court) {
      return 0;
    }

    return court.pricePerHour * MATCH_DURATION_HOURS;
  });

  /** Tarifa de servicio total (por jugador). */
  protected readonly serviceFeeTotal = computed(
    () => SERVICE_FEE_PER_PLAYER * this.capacity(),
  );

  /** Lo que paga cada jugador (cancha + tarifa). */
  protected readonly pricePerPlayer = computed(() => {
    const capacity = this.capacity();

    if (capacity <= 0) {
      return 0;
    }

    return Math.round(this.rentalTotal() / capacity) + SERVICE_FEE_PER_PLAYER;
  });

  /** Adelanto que se cobra al crear la reserva. */
  protected readonly depositAmount = computed(() =>
    Math.round((this.rentalTotal() * this.depositPercent) / 100),
  );

  /** Desglose del paso 3. */
  protected readonly breakdownLines = computed<PriceLine[]>(() => [
    { label: 'Reserva de Cancha', value: toCop(this.rentalTotal()) },
    { label: 'Tasa de servicio', value: toCop(this.serviceFeeTotal()) },
    {
      label: `Tu cupo (1/${this.capacity()})`,
      value: toCop(this.pricePerPlayer()),
      caption: 'Precio por jugador',
    },
  ]);

  /** Líneas del panel oscuro del paso 2. */
  protected readonly priceLines = computed<PriceLine[]>(() => [
    {
      label: `Field Rental (${MATCH_DURATION_HOURS}h)`,
      value: toCop(this.rentalTotal()),
    },
  ]);

  /** Etiqueta de la acción principal del paso 2. */
  protected readonly pricePanelCaption = computed(
    () => 'PRECIO CALCULADO POR JUGADOR',
  );

  /** Etiqueta del periodo en el resumen. */
  protected readonly durationLabel = computed(
    () => `${MATCH_DURATION_HOURS} Hora`,
  );

  /** "$120.000 COP" */
  protected readonly rentalTotalLabel = computed(() => toCop(this.rentalTotal()));

  /** "$36.000 COP" */
  protected readonly depositAmountLabel = computed(() => toCop(this.depositAmount()));

  /** "$84.000 COP" */
  protected readonly remainingLabel = computed(() =>
    toCop(this.rentalTotal() - this.depositAmount()),
  );

  /** "$12.250 COP" */
  protected readonly pricePerPlayerLabel = computed(() => toCop(this.pricePerPlayer()));

  /** Payload del QR mostrado en la confirmación. */
  protected readonly qrPayload = computed(() => {
    const created = this.created();

    if (!created) {
      return '';
    }

    return created.qrPayload || `CANCHALIBRE:${created.code}:${created.bookingId}`;
  });

  constructor() {
    this.crearPartidoService.getCourts().subscribe((courts) => this.courts.set(courts));
  }

  /** Avanza al siguiente paso validando lo mínimo indispensable. */
  protected onNext(): void {
    const step = this.step();

    if (step === 1) {
      if (!this.selectedCourt()) {
        return;
      }

      this.loadAvailability();
      this.step.set(2);
      return;
    }

    if (step === 2) {
      if (!this.selectedSlot()) {
        return;
      }

      this.step.set(3);
      return;
    }

    if (step === 3) {
      this.create(true);
    }
  }

  /** Vuelve al paso anterior. */
  protected onBack(): void {
    const step = this.step();

    if (step <= 1) {
      void this.router.navigateByUrl('/dashboard');
      return;
    }

    this.step.set((step - 1) as CreateStep);
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  protected onCourtSelected(court: CourtOption): void {
    this.selectedCourt.set(court);

    // El cupo nunca puede superar el del espacio, y el formato sugiere uno.
    this.capacity.set(Math.min(court.capacity, this.selectedFormat().capacity));
  }

  protected onSlotSelected(value: string): void {
    this.selectedSlot.set(value);
  }

  protected onFormatSelected(format: FormatOption): void {
    this.selectedFormat.set(format);
    this.capacity.set(Math.min(this.court()?.capacity ?? format.capacity, format.capacity));
  }

  protected onCapacityChange(value: number): void {
    this.capacity.set(value);
  }

  /** Cambia la fecha del partido y recarga las franjas disponibles. */
  protected onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (!value) {
      return;
    }

    this.matchDate.set(value);
    this.loadAvailability();
  }

  /** Crea el partido. `pay` indica si además se cobra el adelanto. */
  protected create(pay: boolean): void {
    const court = this.court();
    const slot = this.slot();

    if (!court || !slot || this.pending()) {
      return;
    }

    this.pending.set(true);

    const draft = {
      spaceId: court.id,
      sportId: court.sportId,
      matchDate: this.matchDate(),
      startTime: slot.value,
      endTime: slot.endTime,
      format: this.selectedFormat().value,
      capacity: this.capacity(),
      priceTotal: this.rentalTotal(),
    };

    this.crearPartidoService.createMatch(draft).subscribe((created) => {
      if (!pay) {
        this.created.set(created);
        this.pending.set(false);
        this.step.set(4);
        return;
      }

      this.crearPartidoService.payDeposit(created.bookingId).subscribe(() => {
        this.crearPartidoService.getQrPayload(created.bookingId).subscribe((payload) => {
          this.created.set({ ...created, qrPayload: payload });
          this.pending.set(false);
          this.step.set(4);
        });
      });
    });
  }

  /** Cierra el asistente y vuelve al detalle del partido. */
  protected onFinish(): void {
    void this.router.navigateByUrl('/reservas');
  }

  /** Carga las franjas disponibles de la cancha elegida. */
  private loadAvailability(): void {
    const court = this.court();

    if (!court) {
      return;
    }

    this.crearPartidoService
      .getAvailability(court.id, this.matchDate())
      .subscribe((slots) => {
        this.slots.set(slots);

        const firstAvailable = slots.find((slot) => slot.available);
        this.selectedSlot.set(firstAvailable?.value ?? '');
      });
  }

  /** "18:00" -> "6:00 PM" */
  private to12h(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }
}
