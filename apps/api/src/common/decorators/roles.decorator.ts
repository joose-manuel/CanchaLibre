import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@canchalibre/shared-domain';

export const ROLES_KEY = 'roles';

/** Restringe una ruta a uno o varios roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
