import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { CANCHA_LIBRE_PRESET } from '../theme/cancha-libre.preset';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    providePrimeNG({
      theme: {
        preset: CANCHA_LIBRE_PRESET,
        options: {
          /*
           * PrimeNG cambia a su tema oscuro con la misma clase que usa
           * CanchaLibre (`dark-mode` en `<html>`), de modo que ambos
           * sistemas visuales se commutan a la vez.
           */
          darkModeSelector: '.dark-mode',
          cssLayer: false,
        },
      },
    }),
    provideHttpClient(),
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
};
