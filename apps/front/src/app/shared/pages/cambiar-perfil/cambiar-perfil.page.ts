import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ProfileModeCardComponent } from '../../components/profile-mode-card/profile-mode-card.component';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
import { MediaQueryService } from '../../services/media-query.service';
import { SessionService } from '../../services/session.service';
import {
  CURRENT_PROFILE_LABEL,
  PAGE_TITLE,
  SWITCH_MODE_LABEL,
} from './constants/cambiar-perfil.constants';
import { ProfileMode, ProfileModeKey } from './interfaces/cambiar-perfil.interface';
import { CambiarPerfilService } from './services/cambiar-perfil.service';

@Component({
  selector: 'cl-cambiar-perfil-page',
  imports: [AppMenuComponent, ConfirmDialogComponent, ProfileModeCardComponent],
  templateUrl: './cambiar-perfil.page.html',
  styleUrl: './cambiar-perfil.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambiarPerfilPage {
  private readonly cambiarPerfilService = inject(CambiarPerfilService);
  private readonly mediaQuery = inject(MediaQueryService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly title = PAGE_TITLE;
  protected readonly currentProfileLabel = CURRENT_PROFILE_LABEL;
  protected readonly switchModeLabel = SWITCH_MODE_LABEL;

  protected readonly modes = signal<ProfileMode[]>([]);

  /** Modo activo del usuario. */
  protected readonly activeKey = computed<ProfileModeKey>(() =>
    this.session.isOwner() ? 'owner' : 'player',
  );

  protected readonly pending = signal(false);

  /**
   * Modo que el usuario quiere activar y que aún espera confirmación.
   *
   * El modo canchas es exclusivo de propietarios y gestores, así que pide
   * una confirmación antes de cambiar de rol.
   */
  private readonly pendingMode = signal<ProfileMode | null>(null);

  /** Diálogo de confirmación abierto. */
  protected readonly dialogOpen = signal(false);
  protected readonly dialogClosing = signal(false);

  constructor() {
    this.cambiarPerfilService.getModes().subscribe((modes) => this.modes.set(modes));
  }

  /** Etiqueta del botón de cada tarjeta. */
  protected actionLabel(mode: ProfileMode): string {
    return mode.key === this.activeKey()
      ? this.currentProfileLabel
      : this.switchModeLabel;
  }

  /** `true` si la tarjeta es la del modo activo. */
  protected isActive(mode: ProfileMode): boolean {
    return mode.key === this.activeKey();
  }

  /** Cambia al modo elegido. */
  protected onSelect(mode: ProfileMode): void {
    if (this.pending() || this.isActive(mode)) {
      return;
    }

    // El modo canchas pide confirmación antes de cambiar el rol.
    if (mode.key === 'owner') {
      this.pendingMode.set(mode);
      this.dialogClosing.set(false);
      this.dialogOpen.set(true);
      return;
    }

    this.applyMode(mode);
  }

  /** Confirma el cambio de modo. */
  protected onConfirmMode(): void {
    const mode = this.pendingMode();

    this.closeDialog();

    if (!mode) {
      return;
    }

    this.applyMode(mode);

    // Al entrar al modo canchas lo natural es seguir con las sedes.
    void this.router.navigateByUrl('/canchas');
  }

  /** Cancela el cambio de modo. */
  protected onCancelMode(): void {
    this.pendingMode.set(null);
    this.closeDialog();
  }

  /** Aplica el cambio de rol. */
  private applyMode(mode: ProfileMode): void {
    this.pending.set(true);

    this.cambiarPerfilService.changeMode(mode).subscribe((role) => {
      this.session.setRole(role);
      this.pending.set(false);
    });
  }

  /** Cierra el diálogo con la animación de salida. */
  private closeDialog(): void {
    if (this.dialogClosing()) {
      return;
    }

    this.dialogClosing.set(true);
    setTimeout(() => {
      this.dialogOpen.set(false);
      this.dialogClosing.set(false);
    }, 220);
  }

  /** Vuelve al perfil. */
  protected goBack(): void {
    void this.router.navigateByUrl('/perfil');
  }
}
