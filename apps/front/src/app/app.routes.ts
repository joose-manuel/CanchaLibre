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
  {
    path: 'perfil',
    loadComponent: () =>
      import('./shared/pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'reservas',
    loadComponent: () =>
      import('./shared/pages/reservas/reservas.page').then((m) => m.ReservasPage),
  },
  {
    path: 'crear-partido',
    loadComponent: () =>
      import('./shared/pages/crear-partido/crear-partido.page').then(
        (m) => m.CrearPartidoPage,
      ),
  },
];
