import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SpaceType } from '@canchalibre/shared-domain';
import { ChipOption, ChipSelectComponent } from '../../components/chip-select/chip-select.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { SpaceRowComponent } from '../../components/space-row/space-row.component';
import { WizardHeaderComponent } from '../../components/wizard-header/wizard-header.component';
import {
  BALANCE_METHODS,
  CANCEL_WINDOWS,
  DEPOSIT_MODES,
  DEFAULT_POLICIES,
  PAGE_TITLE,
  PHONE_PREFIX,
  SPACE_TYPES,
  STEP_1_FOOTNOTE,
  STEP_1_HINT,
  STEP_2_HINT,
  ADDED_SPACES_LABEL,
  emptySpace,
  toSportIconKey,
} from './constants/registrar-cancha.constants';
import {
  CityOption,
  RegistroStep,
  SpaceDraft,
  SportOption,
  VenueBasicInfo,
  VenuePolicies,
} from './interfaces/registrar-cancha.interface';
import { RegistrarCanchaService } from './services/registrar-cancha.service';

/** Total de pasos del asistente. */
const TOTAL_STEPS = 3;

/** Porcentaje completado de cada paso (según el diseño). */
const STEP_PERCENTS: Record<RegistroStep, number> = { 1: 35, 2: 66, 3: 100 };

/** Título de cada paso. */
const STEP_TITLES: Record<RegistroStep, string> = {
  1: 'Información básica',
  2: 'Configuración de Espacios',
  3: 'Políticas y Pagos',
};

@Component({
  selector: 'cl-registrar-cancha-page',
  imports: [ChipSelectComponent, FormFieldComponent, SpaceRowComponent, WizardHeaderComponent],
  templateUrl: './registrar-cancha.page.html',
  styleUrl: './registrar-cancha.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrarCanchaPage {
  private readonly registrarCanchaService = inject(RegistrarCanchaService);
  private readonly router = inject(Router);

  protected readonly totalSteps = TOTAL_STEPS;
  protected readonly pageTitle = PAGE_TITLE;
  protected readonly phonePrefix = PHONE_PREFIX;
  protected readonly step1Hint = STEP_1_HINT;
  protected readonly step2Hint = STEP_2_HINT;
  protected readonly step1Footnote = STEP_1_FOOTNOTE;
  protected readonly addedSpacesLabel = ADDED_SPACES_LABEL;

  protected readonly step = signal<RegistroStep>(1);
  protected readonly percent = computed(() => STEP_PERCENTS[this.step()]);
  protected readonly stepTitle = computed(() => STEP_TITLES[this.step()]);

  /** Catálogos de la API. */
  protected readonly sports = signal<SportOption[]>([]);
  protected readonly cities = signal<CityOption[]>([]);

  /** Datos del paso 1. */
  protected readonly info = signal<VenueBasicInfo>({
    name: '',
    cityId: '',
    address: '',
    phone: '',
    sportIds: [],
  });

  /** Espacios del paso 2. */
  protected readonly spaces = signal<SpaceDraft[]>([]);
  /** Índice del espacio que se está editando (-1 si se agrega uno nuevo). */
  protected readonly editingSpace = signal(-1);

  /** Políticas del paso 3. */
  protected readonly policies = signal<VenuePolicies>({ ...DEFAULT_POLICIES });

  /** Id de la sede cuando se está editando una existente. */
  protected readonly venueId = signal<string | null>(null);

  protected readonly saving = signal(false);

  /**
   * Query params de la ruta.
   *
   * `sede` = id de la sede a editar (si no, se crea una nueva).
   * `paso` = paso inicial del asistente.
   */
  readonly sede = input<string>();
  readonly paso = input<string>();

  constructor() {
    this.registrarCanchaService.getSports().subscribe((sports) => this.sports.set(sports));
    this.registrarCanchaService.getCities().subscribe((cities) => this.cities.set(cities));

    // Al abrir con `?sede=...` se carga la sede y se arranca en su paso.
    effect(() => {
      const venueId = this.sede();

      if (!venueId || this.venueId() === venueId) {
        return;
      }

      this.loadVenue(venueId);
    });

    effect(() => {
      const step = Number(this.paso());

      if (step >= 1 && step <= TOTAL_STEPS) {
        this.step.set(step as RegistroStep);
      }
    });
  }

  /** Opciones de deportes para el chip-select. */
  protected readonly sportChips = computed<ChipOption[]>(() =>
    this.sports().map((sport) => ({
      value: String(sport.id),
      label: sport.name,
      sportKey: toSportIconKey(sport.name),
    })),
  );

  /** Deportes permitidos del espacio en edición. */
  protected readonly spaceSportChips = computed<ChipOption[]>(() =>
    this.sports().map((sport) => ({
      value: String(sport.id),
      label: sport.name,
      sportKey: toSportIconKey(sport.name),
    })),
  );

  /** Opciones del tipo de espacio. */
  protected readonly spaceTypeOptions = SPACE_TYPES;

  /** Opciones de la ventana de cancelación. */
  protected readonly cancelWindowOptions = CANCEL_WINDOWS;

  /** Opciones de la forma de calcular el anticipo. */
  protected readonly depositModes = DEPOSIT_MODES;

  /** Opciones del método de pago del saldo. */
  protected readonly balanceMethods = BALANCE_METHODS;

  /** Espacio en edición (o `null` si se está agregando uno nuevo). */
  protected readonly currentSpace = computed<SpaceDraft | null>(() => {
    const index = this.editingSpace();
    const space = this.spaces()[index];

    return space ?? null;
  });

  /** Deportes de la sede seleccionados, como texto (para los chips). */
  protected readonly selectedVenueSports = computed(() =>
    this.info().sportIds.map((id) => String(id)),
  );

  /** Deportes permitidos del espacio en edición, como texto. */
  protected readonly selectedSpaceSports = computed(() =>
    (this.currentSpace()?.sportIds ?? []).map((id) => String(id)),
  );

  /** Id de la sede que se está editando (si aplica). */
  protected setVenueId(venueId: string | null): void {
    this.venueId.set(venueId);
  }

  /** Carga los datos de una sede existente para editarla. */
  protected loadVenue(venueId: string): void {
    this.venueId.set(venueId);

    this.registrarCanchaService.getVenue(venueId).subscribe((data) => {
      if (!data) {
        return;
      }

      this.spaces.set(data.spaces);
    });
  }

  // ---------- Paso 1 ----------

  protected onName(value: string): void {
    this.info.update((info) => ({ ...info, name: value }));
  }

  protected onCity(value: string): void {
    this.info.update((info) => ({ ...info, cityId: value }));
  }

  protected onAddress(value: string): void {
    this.info.update((info) => ({ ...info, address: value }));
  }

  protected onPhone(value: string): void {
    this.info.update((info) => ({ ...info, phone: value }));
  }

  protected onSportsChange(values: string[]): void {
    this.info.update((info) => ({
      ...info,
      sportIds: values.map((value) => Number(value)),
    }));
  }

  // ---------- Paso 2 ----------

  protected onSpaceName(value: string): void {
    this.patchSpace({ name: value });
  }

  protected onSpaceCapacity(value: string): void {
    this.patchSpace({ capacity: Number(value) || 0 });
  }

  protected onSpaceType(value: string): void {
    this.patchSpace({ type: value as SpaceType });
  }

  protected onSpaceSportsChange(values: string[]): void {
    this.patchSpace({ sportIds: values.map((value) => Number(value)) });
  }

  /** Añade un espacio vacío a la lista. */
  protected addSpace(): void {
    this.spaces.update((spaces) => [...spaces, emptySpace(spaces.length)]);
    this.editingSpace.set(this.spaces().length - 1);
  }

  /** Empieza a editar un espacio existente. */
  protected editSpace(space: SpaceDraft): void {
    this.editingSpace.set(this.spaces().findIndex((item) => item.id === space.id));
  }

  /** Elimina un espacio de la lista. */
  protected removeSpace(space: SpaceDraft): void {
    this.spaces.update((spaces) => spaces.filter((item) => item.id !== space.id));

    const index = this.editingSpace();
    if (index >= this.spaces().length) {
      this.editingSpace.set(this.spaces().length - 1);
    }
  }

  /** Copia los datos del último espacio como base para uno nuevo. */
  protected duplicateLastSpace(): void {
    const spaces = this.spaces();
    const last = spaces[spaces.length - 1];

    if (!last) {
      return;
    }

    this.spaces.update((list) => [
      ...list,
      {
        ...last,
        id: `space-${list.length}`,
        name: `${last.name} (copia)`,
      },
    ]);

    this.editingSpace.set(this.spaces().length - 1);
  }

  // ---------- Paso 3 ----------

  protected onDepositMode(value: string): void {
    this.policies.update((policies) => ({
      ...policies,
      depositFixed: value === 'fixed',
    }));
  }

  protected onDepositValue(value: string): void {
    this.policies.update((policies) => ({
      ...policies,
      depositPercent: Number(value) || 0,
      depositAmount: Number(value) || 0,
    }));
  }

  protected onCancelWindow(value: string): void {
    this.policies.update((policies) => ({
      ...policies,
      cancelWindowHours: Number(value),
    }));
  }

  protected onBalanceMethod(value: string): void {
    this.policies.update((policies) => ({
      ...policies,
      balanceMethod: value as VenuePolicies['balanceMethod'],
    }));
  }

  // ---------- Navegación ----------

  protected onBack(): void {
    const step = this.step();

    if (step === 1) {
      void this.router.navigateByUrl('/canchas');
      return;
    }

    this.step.set((step - 1) as RegistroStep);
  }

  /** Valida el paso actual y avanza. */
  protected onNext(): void {
    const step = this.step();

    if (step === 1) {
      if (!this.info().name.trim() || !this.info().cityId) {
        return;
      }

      this.step.set(2);
      return;
    }

    if (step === 2) {
      this.step.set(3);
      return;
    }

    this.save();
  }

  /** Guarda la sede con sus espacios y políticas. */
  protected save(): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);

    const policies = this.policies();
    const existingVenueId = this.venueId();

    const create = (venueId: string) => {
      const spaces = this.spaces();

      if (spaces.length === 0) {
        this.finish();
        return;
      }

      spaces.forEach((space) => {
        this.registrarCanchaService.createSpace(venueId, space).subscribe();
      });

      this.finish();
    };

    if (existingVenueId) {
      this.registrarCanchaService
        .savePolicies(existingVenueId, policies)
        .subscribe(() => create(existingVenueId));
      return;
    }

    this.registrarCanchaService
      .createVenue(this.info(), policies)
      .subscribe((venueId) => create(venueId));
  }

  /** Vuelve a la lista de canchas. */
  private finish(): void {
    this.saving.set(false);
    void this.router.navigateByUrl('/canchas');
  }

  /** Aplica un cambio al espacio en edición. */
  private patchSpace(patch: Partial<SpaceDraft>): void {
    const index = this.editingSpace();

    if (index < 0) {
      return;
    }

    this.spaces.update((spaces) =>
      spaces.map((space, position) => {
        if (position !== index) {
          return space;
        }

        const merged = { ...space, ...patch };
        const sportName = this.sports().find((sport) => sport.id === merged.sportIds[0])?.name;

        return {
          ...merged,
          summary: `${sportName ?? 'Deporte'} • Cap. ${merged.capacity} pers.`,
        };
      }),
    );
  }
}
