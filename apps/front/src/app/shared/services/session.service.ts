import { Injectable, computed, signal } from '@angular/core';
import { UserRole } from '@canchalibre/shared-domain';

/** Clave donde se guarda el rol del usuario. */
const ROLE_STORAGE_KEY = 'cl_user_role';

/**
 * Sesión del usuario en la web.
 *
 * Centraliza el rol (`player` / `owner`) para que varias páginas puedan
 * saber en qué modo está el usuario sin repetir la llamada a la API ni
 * leer `localStorage` por su cuenta.
 *
 * El rol se persiste para que sobreviva a una recarga: es lo que permite
 * que la pantalla "Cambiar Perfil" muestre la insignia "Activo" sobre el
 * modo correcto nada más abrir.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly role = signal<UserRole>(this.readStoredRole());

  /** Rol actual del usuario. */
  readonly currentRole = this.role.asReadonly();

  /** `true` si el usuario está en modo canchas (propietario). */
  readonly isOwner = computed(() => this.role() === UserRole.Owner);

  /** Actualiza el rol y lo persiste. */
  setRole(role: UserRole): void {
    this.role.set(role);

    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch {
      // Si el almacenamiento está bloqueado, el rol vive solo en memoria.
    }
  }

  /** Rol guardado, o `player` por defecto. */
  private readStoredRole(): UserRole {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);

      if (stored === UserRole.Owner || stored === UserRole.Player) {
        return stored;
      }
    } catch {
      // Almacenamiento no disponible: se usa el rol por defecto.
    }

    return UserRole.Player;
  }
}
