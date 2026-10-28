#!/usr/bin/env node
/**
 * Inyecta la URL de la API en el archivo de entorno de producción.
 *
 * Angular no lee variables de entorno por sí solo, así que este script
 * reescribe `environment.prod.ts` antes del build con el valor de
 * `CL_API_BASE_URL`.
 *
 * Uso:
 *   node tools/set-api-url.mjs
 *
 * Variables:
 *   CL_API_BASE_URL  -> base de la API (ej. https://api.canchalibre.co/api)
 *
 * Si no está definida se usa `https://api.canchalibre.co/api` para que el
 * build nunca falle por falta de configuración.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_API_BASE_URL = 'https://api.canchalibre.co/api';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const targetFile = join(rootDir, 'apps/front/src/environments/environment.prod.ts');

const apiBaseUrl = process.env.CL_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

const content = `/**
 * Configuración del entorno de producción.
 *
 * Generado por \`tools/set-api-url.mjs\`. No editar a mano.
 */
export const environment = {
  production: true,
  /** Base de la API del backend en producción. */
  apiBaseUrl: '${apiBaseUrl}',
};
`;

writeFileSync(targetFile, content, 'utf8');

console.log(`[set-api-url] API base -> ${apiBaseUrl}`);
