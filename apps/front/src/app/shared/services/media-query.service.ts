import { DestroyRef, Injectable, inject, signal } from '@angular/core';

const DESKTOP_QUERY = '(min-width: 960px)';

/**
 * Estado responsive compartido. Permite que las páginas cambien de
 * variante (por ejemplo, menú inferior en móvil y lateral en escritorio)
 * sin depender del CSS.
 */
@Injectable({ providedIn: 'root' })
export class MediaQueryService {
  private readonly destroyRef = inject(DestroyRef);

  readonly isDesktop = signal(false);

  constructor() {
    const query = window.matchMedia(DESKTOP_QUERY);
    this.isDesktop.set(query.matches);

    const listener = (event: MediaQueryListEvent) => this.isDesktop.set(event.matches);
    query.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', listener));
  }
}
