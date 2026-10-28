import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { MenuItem, MenuVariant } from '../../interfaces/menu-item.interface';

/** Posición del indicador deslizante de la barra inferior. */
interface IndicatorState {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

/** Holgura del indicador respecto al icono, a cada lado (px). */
const INDICATOR_PADDING = 20;

@Component({
  selector: 'cl-app-menu',
  imports: [BrandLogoComponent],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
})
export class AppMenuComponent {
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly items = input.required<MenuItem[]>();
  readonly activeKey = input('');
  readonly variant = input<MenuVariant>('bottom');
  readonly createLabel = input('Crear');
  readonly showCreate = input(true);
  readonly brandName = input('CanchaLibre');
  readonly navigate = output<string>();
  readonly create = output<void>();

  protected readonly leftItems = computed(() => this.items().slice(0, 2));
  protected readonly rightItems = computed(() => this.items().slice(2));

  /**
   * Indicador deslizante: en iOS el "pill" del tab activo se desplaza de un
   * icono al siguiente en lugar de aparecer y desaparecer. Se posiciona
   * midiendo el icono activo dentro de la barra.
   */
  protected readonly indicator = signal<IndicatorState>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  });

  private readonly navItemRefs = viewChildren<ElementRef<HTMLButtonElement>>('navItem');
  private readonly navIconRefs = viewChildren<ElementRef<HTMLElement>>('navIcon');
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // La medición del DOM ocurre después del render: el indicador se
    // posiciona sobre el icono activo ya pintado. Se leen también las
    // queries de vista para que el efecto se re-evalúe cuando cambien los
    // items del menú.
    afterRenderEffect(() => {
      const activeKey = this.activeKey();
      const variant = this.variant();
      this.navItemRefs();
      this.navIconRefs();

      if (variant !== 'bottom') {
        untracked(() =>
          this.indicator.set({ x: 0, y: 0, width: 0, height: 0, visible: false }),
        );
        return;
      }

      this.syncIndicator(activeKey);
    });
  }

  /**
   * Emite la navegación y, si el item tiene ruta, navega a ella.
   * Así el mismo menú sirve para el dashboard y para el perfil.
   */
  protected onNavigate(item: MenuItem): void {
    this.navigate.emit(item.key);

    if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
  }

  /** Mide el icono activo y reposiciona el indicador. */
  private syncIndicator(activeKey: string): void {
    const index = this.items().findIndex((item) => item.key === activeKey);
    const iconRef = this.navIconRefs()[index];
    const itemRef = this.navItemRefs()[index];

    if (index < 0 || !iconRef || !itemRef) {
      this.indicator.update((state) => ({ ...state, visible: false }));
      return;
    }

    const item = itemRef.nativeElement;
    const icon = iconRef.nativeElement;
    const bar = item.closest('.nav__bar') as HTMLElement | null;

    if (!bar) {
      return;
    }

    /*
     * `getBoundingClientRect()` incluye las transformaciones CSS, y el icono
     * activo se escala (scale 1.12): al medir con el rect se obtiene una
     * caja distinta a la del resto de iconos y el indicador quedaría
     * descentrado. Por eso el centro se calcula con las métricas de layout
     * (`offsetLeft` / `offsetWidth`), que no dependen de las transformaciones.
     */
    const itemRect = item.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;
    const iconCenterX = itemRect.left + icon.offsetLeft + iconWidth / 2;
    const iconCenterY = itemRect.top + icon.offsetTop + iconHeight / 2;

    // El indicador es `position: absolute` dentro de la barra: su origen es
    // el borde interior del padding box, no el borde exterior.
    const barContentLeft = barRect.left + bar.clientLeft;
    const barContentTop = barRect.top + bar.clientTop;
    const width = iconWidth + INDICATOR_PADDING;
    const height = iconHeight + INDICATOR_PADDING;
    const x = iconCenterX - barContentLeft - width / 2;
    const y = iconCenterY - barContentTop - height / 2;

    this.indicator.set({ x, y, width, height, visible: true });

    this.observeBarResize(bar);
  }

  /** Mantiene el indicador alineado si la barra cambia de tamaño. */
  private observeBarResize(bar: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.syncIndicator(this.activeKey());
      this.changeDetector.markForCheck();
    });

    this.resizeObserver.observe(bar);
  }
}
