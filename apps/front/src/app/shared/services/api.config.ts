import { environment } from '../../../environments/environment';

/**
 * Configuración de consumo de la API desde la web.
 *
 * La base de la API sale de `environments/environment.ts` (desarrollo) o de
 * `environments/environment.prod.ts` (producción), que se genera en tiempo de
 * build con `tools/set-api-url.mjs`.
 *
 * Cuando el token no exista (o la API no esté levantada) los servicios caen
 * a los datos quemados de cada página.
 */
export const API_BASE_URL = environment.apiBaseUrl;

/** Clave donde el login guarda el access token. */
export const ACCESS_TOKEN_KEY = 'cl_access_token';
