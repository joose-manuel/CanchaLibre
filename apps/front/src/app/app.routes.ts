import { Route } from '@angular/router';

/**
 * Rutas del shell web.
 * Cada feature se cargará de forma diferida desde `src/app/features/<feature>`.
 */
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/public/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/public/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
];
