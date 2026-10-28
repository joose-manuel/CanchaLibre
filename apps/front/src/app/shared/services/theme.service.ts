import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/** Modos de tema soportados. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Modo resuelto (sin `system`). */
export type ResolvedTheme = 'light' | 'dark';

/** Clave en localStorage. */
export const THEME_STORAGE_KEY = 'cl_theme_mode';

/**
 * Servicio de tema.
 *
 * Gestiona el modo claro/oscuro de la aplicación:
 *
 * - persiste la preferencia en `localStorage`,
 * - sigue la preferencia del sistema cuando el modo es `system`,
 * - aplica la clase `dark-mode` en `<html>`, que es la que activan tanto
 *   PrimeNG (`darkModeSelector`) como los tokens propios de CanchaLibre.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly mode = signal<ThemeMode>('system');
  private readonly systemPrefersDark = signal(false);

  /** Modo configurado por el usuario. */
  readonly currentMode = this.mode.asReadonly();

  /** Tema efectivo que se está mostrando. */
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const mode = this.mode();

    if (mode === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }

    return mode;
  });

  /** `true` si la aplicación está en modo oscuro. */
  readonly isDark = computed(() => this.resolvedTheme() === 'dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.systemPrefersDark.set(
        window.matchMedia('(prefers-color-scheme: dark)').matches,
      );

      this.mode.set(this.readStoredMode());

      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) => {
          this.systemPrefersDark.set(event.matches);
          this.applyTheme();
        });
    }

    this.applyTheme();
  }

  /** Cambia el modo (usado por el toggle de la interfaz). */
  setMode(mode: ThemeMode): void {
    this.mode.set(mode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }

    this.applyTheme();
  }

  /** Alterna entre claro y oscuro. */
  toggle(): void {
    this.setMode(this.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }

  /** Aplica el tema al documento. */
  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = this.document.documentElement;
    const isDark = this.resolvedTheme() === 'dark';

    root.classList.toggle('dark-mode', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }

  /** Lee la preferencia guardada (por defecto `system`). */
  private readStoredMode(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'system';
    }

    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return 'system';
  }
}
