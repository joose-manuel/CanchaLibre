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
    path: 'cambiar-perfil',
    loadComponent: () =>
      import('./shared/pages/cambiar-perfil/cambiar-perfil.page').then(
        (m) => m.CambiarPerfilPage,
      ),
  },
  {
    path: 'canchas',
    loadComponent: () =>
      import('./shared/pages/canchas/canchas.page').then((m) => m.CanchasPage),
  },
  {
    path: 'registrar-cancha',
    loadComponent: () =>
      import('./shared/pages/registrar-cancha/registrar-cancha.page').then(
        (m) => m.RegistrarCanchaPage,
      ),
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
  {
    path: 'agenda',
    loadComponent: () =>
      import('./shared/pages/agenda/agenda.page').then((m) => m.AgendaPage),
  },
  {
    path: 'agenda/reservas',
    loadComponent: () =>
      import('./shared/pages/reservas-admin/reservas-admin.page').then(
        (m) => m.ReservasAdminPage,
      ),
  },
  {
    path: 'agenda/reservas/detalle',
    loadComponent: () =>
      import('./shared/pages/reserva-detalle/reserva-detalle.page').then(
        (m) => m.ReservaDetallePage,
      ),
  },
  {
    path: 'agenda/disponibilidad',
    loadComponent: () =>
      import('./shared/pages/disponibilidad/disponibilidad.page').then(
        (m) => m.DisponibilidadPage,
      ),
  },
  {
    path: 'agenda/pagos',
    loadComponent: () =>
      import('./shared/pages/finanzas/finanzas.page').then((m) => m.FinanzasPage),
  },
  {
    path: 'mensajes',
    loadComponent: () =>
      import('./shared/pages/mensajes/mensajes.page').then((m) => m.MensajesPage),
  },
];
