import { Injectable } from '@angular/core';
import { UserProfile } from '../../../interfaces/user-profile.interface';

const CURRENT_USER: UserProfile = {
  id: 'u-1',
  firstName: 'Carlos',
  email: 'player@canchalibre.co',
  avatarSrc: 'images/avatar-carlos.png',
  city: 'Bogotá, Colombia',
  level: 'Semi-Pro',
  online: true,
};

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * Perfil de la sesión actual.
   * Reemplazar por `GET /api/auth/me` con el token Bearer cuando el login
   * consuma la API: el token ya vive en `localStorage` bajo `cl_access_token`.
   */
  getCurrentUser(): UserProfile {
    return CURRENT_USER;
  }
}
