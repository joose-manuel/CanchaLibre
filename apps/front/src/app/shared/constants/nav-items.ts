import { MenuItem } from '../interfaces/menu-item.interface';

/**
 * Items del menú principal.
 *
 * Es una lista compartida para que todas las páginas internas (dashboard,
 * perfil, reservas) muestren exactamente la misma navegación: el usuario
 * siempre encuentra los mismos destinos en el mismo orden.
 */
export const MAIN_NAV_ITEMS: MenuItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
  { key: 'reservas', label: 'Reservas', icon: 'pi pi-calendar', route: '/reservas' },
  { key: 'mensajes', label: 'Mensajes', icon: 'pi pi-comments', badge: 3 },
  { key: 'perfil', label: 'Perfil', icon: 'pi pi-user', route: '/perfil' },
];
