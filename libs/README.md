# Librerías compartidas

Código TypeScript puro reutilizado por `api`, `front` y `movil`. **No dependen de Angular, NestJS, Ionic ni Capacitor.**

```text
libs/
└─ shared/
   ├─ domain/     # Enums, modelos y contratos del API
   └─ utils/      # Fechas, formato COP, etiquetas y geolocalización
```

## `@canchalibre/shared-domain`

`libs/shared/domain/src/lib/`

| Archivo | Contenido |
| --- | --- |
| `enums.ts` | Enums de dominio: roles, estados de reserva, estados de partido, etc. |
| `models.ts` | Modelos de lectura compartidos entre backend y frontends |
| `contracts.ts` | Contratos de request/response del API |

```ts
import { BookingStatus, UserRole } from '@canchalibre/shared-domain';
```

## `@canchalibre/shared-utils`

`libs/shared/utils/src/lib/`

| Archivo | Contenido |
| --- | --- |
| `dates.ts` | Utilidades de fecha y rangos horarios |
| `format.ts` | Formato de moneda COP y números |
| `labels.ts` | Etiquetas legibles para enums y estados |
| `geo.ts` | Cálculo de distancia (Haversine) y utilidades geográficas |

```ts
import { formatCop, haversineDistanceKm } from '@canchalibre/shared-utils';
```

## Reglas

1. **Sin frameworks.** Si una utilidad necesita `@angular/*`, `@nestjs/*` o `@ionic/*`, vive en la app correspondiente, no aquí.
2. **Sin efectos secundarios.** Nada de acceso a `window`, `document`, `localStorage` ni llamadas HTTP.
3. **Sin dependencias circulares.** `domain` no importa de `utils`; `utils` puede importar tipos de `domain` si es necesario.
4. **Un cambio aquí impacta a las tres apps.** Ejecutar `npm run typecheck` y `npm run build` antes de hacer commit.
5. **No crear librerías por adelantado.** Una lib se crea cuando existe código real compartido por al menos dos apps.

## Comandos

```bash
npx nx typecheck shared-domain
npx nx typecheck shared-utils
npm run typecheck            # Todas las apps y librerías
```

## Boundaries

Los tags de Nx son `scope:shared`, `type:domain` y `type:utils`. La regla de `eslint.config.mjs` permite que `scope:shared` dependa únicamente de `scope:shared`, por lo que una librería compartida **no puede** importar código de `api`, `front` o `movil`.
