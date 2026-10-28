/**
 * Configuración del entorno de desarrollo.
 *
 * En producción este archivo se reemplaza por `environment.prod.ts` (ver
 * `fileReplacements` en `apps/front/project.json`), que apunta a la API
 * desplegada.
 */
export const environment = {
  production: false,
  /** Base de la API del backend. */
  apiBaseUrl: 'http://localhost:3000/api',
};
