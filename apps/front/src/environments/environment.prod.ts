/**
 * Configuración del entorno de producción.
 *
 * Este archivo se regenera en tiempo de build con `tools/set-api-url.mjs`,
 * que inyecta el valor de `CL_API_BASE_URL`. El valor de abajo es solo un
 * respaldo para que un build sin configurar nunca quede con una URL inválida.
 */
export const environment = {
  production: true,
  /** Base de la API del backend en producción. */
  apiBaseUrl: 'https://api.canchalibre.co/api',
};
