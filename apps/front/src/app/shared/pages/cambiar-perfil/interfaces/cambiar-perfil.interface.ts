/**
 * Tipos de la página "Cambiar Perfil".
 *
 * Son "view models" de la web: aíslan a la página del contrato del backend.
 * El `CambiarPerfilService` es el único que conoce la API y traduce a estas
 * interfaces.
 */

/**
 * Modos de perfil que el usuario puede alternar.
 *
 * `player` es el modo por defecto (busca partidos); `owner` es el modo
 * canchas (gestiona sus sedes).
 */
export type ProfileModeKey = 'player' | 'owner';

/** Un modo de perfil, listo para pintar en la tarjeta. */
export interface ProfileMode {
  key: ProfileModeKey;
  /** "Modo Jugador" / "Modo Cancha" */
  title: string;
  /** Icono de PrimeIcons. */
  icon: string;
  /** Descripción del modo. */
  description: string;
  /** Portada del modo. */
  imageSrc: string;
}
