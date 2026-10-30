import { ProfileMode } from '../interfaces/cambiar-perfil.interface';

/**
 * Datos quemados de la página "Cambiar Perfil".
 *
 * Los modos son parte del producto (no del backend), así que viven aquí. El
 * cambio de rol sí lo pide el `CambiarPerfilService` a la API.
 */

/**
 * Modos de perfil disponibles en el selector.
 *
 * El orden es deliberado: primero el modo de juego (el más usado) y luego
 * el de canchas.
 */
export const PROFILE_MODES: ProfileMode[] = [
  {
    key: 'player',
    title: 'Modo Jugador',
    icon: 'pi pi-globe',
    description:
      'Busca partidos cerca de ti, únete a equipos y gestiona tus reservas personales.',
    imageSrc: 'images/mode-player.svg',
  },
  {
    key: 'owner',
    title: 'Modo Cancha',
    icon: 'pi pi-briefcase',
    description:
      'Gestiona la agenda de tu complejo, confirma reservas, bloquea horarios y revisa tus ingresos.',
    imageSrc: 'images/mode-owner.svg',
  },
];

/** Etiqueta del botón cuando el modo ya es el activo. */
export const CURRENT_PROFILE_LABEL = 'Perfil actual';

/** Etiqueta del botón para cambiar a un modo que no es el activo. */
export const SWITCH_MODE_LABEL = 'Cambiar a este modo';

/** Título de la pantalla. */
export const PAGE_TITLE = 'Cambiar Perfil';
