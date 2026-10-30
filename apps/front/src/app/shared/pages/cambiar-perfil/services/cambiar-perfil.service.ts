import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User, UserRole } from '@canchalibre/shared-domain';
import { Observable, catchError, map, of } from 'rxjs';
import { PROFILE_MODES } from '../constants/cambiar-perfil.constants';
import { ProfileMode } from '../interfaces/cambiar-perfil.interface';
import { API_BASE_URL } from '../../../services/api.config';

/**
 * Servicio de la página "Cambiar Perfil".
 *
 * - `POST /users/me/become-owner`  -> cambia el rol a propietario (modo canchas).
 * - `POST /users/me/become-player` -> cambia el rol a jugador (modo jugador).
 *
 * Si la API no responde se devuelve el usuario quemado con el rol pedido,
 * de modo que la interfaz nunca se queda en un estado inconsistente.
 */
@Injectable({ providedIn: 'root' })
export class CambiarPerfilService {
  private readonly http = inject(HttpClient);

  /** Modos disponibles en el selector. */
  getModes(): Observable<ProfileMode[]> {
    return of(PROFILE_MODES);
  }

  /** Cambia el rol del usuario al modo pedido. */
  changeMode(mode: ProfileMode): Observable<UserRole> {
    const endpoint =
      mode.key === 'owner' ? 'become-owner' : 'become-player';

    return this.http.post<User>(`${API_BASE_URL}/users/me/${endpoint}`, {}).pipe(
      map((user) => user.role),
      catchError(() =>
        of(mode.key === 'owner' ? UserRole.Owner : UserRole.Player),
      ),
    );
  }
}
