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

/**
 * Menú del modo propietario.
 *
 * Cuando el usuario administra canchas el destinations cambian: la agenda
 * (el trabajo del día) y las canchas (su inventario) sustituyen a las
 * reservas y a los mensajes de juego.
 */
export const OWNER_NAV_ITEMS: MenuItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
  { key: 'agenda', label: 'Agenda', icon: 'pi pi-calendar', route: '/agenda' },
  { key: 'canchas', label: 'Canchas', icon: 'pi pi-building', route: '/canchas' },
  { key: 'perfil', label: 'Perfil', icon: 'pi pi-user', route: '/perfil' },
];
