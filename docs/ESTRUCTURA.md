# Estructura y decisiones de arquitectura

Este documento explica **por qué** el workspace está organizado así y **dónde** debe ir cada cosa. La estructura está pensada para crecer sin convertir el repositorio en una carpeta imposible de navegar.

## 1. Contexto

CanchaLibre necesita tres experiencias distintas:

1. Un **backend** con autenticación, sedes, espacios, partidos, reservas, pagos y modo propietario.
2. Una **aplicación web / PWA** para jugadores y propietarios.
3. Una **aplicación móvil Android** con acceso a capacidades nativas (estado, splash, preferencias, cámara en el futuro).

Las tres comparten el mismo lenguaje de dominio: un partido, una reserva o una sede significan lo mismo en el API, en la web y en el móvil.

## 2. Decisión: monorepo Nx con tres apps

Se eligió **un solo repositorio Nx** con tres aplicaciones desplegables y librerías compartidas:

```text
apps/api     → backend NestJS
apps/front   → shell Angular web/PWA
apps/movil   → shell Ionic + Capacitor para Android
libs/shared  → dominio y utilidades sin framework
```

### Alternativas descartadas

| Alternativa | Por qué no |
| --- | --- |
| Tres repositorios separados | Duplicaría tipos, contratos y utilidades; los cambios de contrato API/front/móvil requerirían tres PRs coordinados. |
| Una sola app Angular responsive | El móvil necesita Capacitor, plugins nativos y una navegación táctil distinta. Mezclar ambas experiencias complica el bundle y el despliegue. |
| Un `front` con carpeta `mobile/` | Rompe el aislamiento de builds: un error en el shell móvil podría afectar el build web y viceversa. |
| Microservicios desde el día uno | El dominio todavía está en una etapa temprana; un monolito modular permite extraer servicios después sin pagar la complejidad operativa ahora. |

### Ventajas del monorepo

- **Un solo `npm install`** y una sola versión de Angular, TypeScript y ESLint.
- **Tipos compartidos**: un cambio en `shared-domain` rompe la compilación de las tres apps si algo quedó inconsistente.
- **Un solo pipeline** de build, lint y typecheck.
- **Boundaries automáticos** con Nx: las apps no pueden importarse entre sí por accidente.

## 3. Regla de oro: apps vs. libs

| Carpeta | Qué contiene | Qué NO debe contener |
| --- | --- | --- |
| `apps/` | Código desplegable, bootstrap, rutas raíz, configuración de build | Lógica reutilizable por otra app |
| `libs/shared/` | Tipos, contratos, enums y funciones puras | Dependencias de Angular, NestJS o Ionic |

Cuando un bloque de código se usa en dos apps, se mueve a `libs/`. Cuando solo lo usa una app, se queda dentro de esa app.

## 4. Backend: monolito modular

`apps/api/src` se organiza por **dominio**, no por tipo de archivo:

```text
src/
├─ app/            # Módulo raíz, controlador y servicio base
├─ common/         # Guards, decoradores, filtros, interfaces, mappers
├─ config/         # Configuración tipada desde variables de entorno
├─ database/       # DataSource, entidades, seed y migraciones
└─ modules/
   ├─ auth/        # controller + service + module + dto/ + strategies/
   ├─ users/
   ├─ cities/
   ├─ sports/
   ├─ venues/
   ├─ spaces/
   ├─ matches/
   ├─ bookings/
   ├─ payments/
   ├─ notifications/
   └─ owner/
```

Cada módulo sigue la misma forma:

```text
modules/<dominio>/
├─ <dominio>.controller.ts
├─ <dominio>.service.ts
├─ <dominio>.module.ts
├─ dto/            # Entradas validadas con class-validator
└─ entities/       # Entidades TypeORM del dominio
```

**Ventajas:**

- Un cambio en reservas se hace en una sola carpeta.
- El módulo se puede extraer a un servicio independiente con bajo esfuerzo.
- Las dependencias entre módulos son explícitas en los `imports` de NestJS.

**Regla:** un módulo no debe importar archivos internos de otro módulo. Si necesita algo, lo expone su `service` o se mueve a `common/`/`libs/`.

## 5. Frontends: feature-first

`apps/front` y `apps/movil` comparten la misma estructura interna:

```text
src/app/
├─ core/           # Singleton: guards, interceptores, servicios de infraestructura
├─ shared/         # Componentes, directivas y pipes sin estado de negocio
├─ features/       # Una carpeta por funcionalidad
│  ├─ auth/
│  ├─ onboarding/
│  ├─ explore/
│  ├─ match-create/
│  ├─ booking/
│  ├─ profile/
│  └─ owner/
├─ layout/         # Shell visual: header, tabs, sidebar, footer
├─ app.ts          # Componente raíz
├─ app.config.ts   # Providers globales
└─ app.routes.ts   # Rutas raíz con lazy loading
```

### Responsabilidades

| Carpeta | Responsabilidad | Ejemplo |
| --- | --- | --- |
| `core/` | Servicios únicos de la app, guards, interceptores HTTP | `AuthService`, `authGuard`, `jwtInterceptor` |
| `shared/` | Piezas de UI reutilizables y sin dependencia de un feature | `ButtonComponent`, `CurrencyCopPipe` |
| `features/<x>/` | Todo lo de una funcionalidad: páginas, componentes, servicios y rutas | `features/booking/pages/booking-page.ts` |
| `layout/` | Estructura visual persistente | `MainLayout`, `TabsLayout` |

### Reglas de importación

- Un feature **puede** importar de `core/`, `shared/` y `libs/shared`.
- Un feature **no debe** importar archivos internos de otro feature. Si necesita compartir algo, se mueve a `shared/` o a una lib.
- `core/` no debe importar de `features/`.
- `shared/` no debe importar de `features/` ni de `core/`.

### Por qué no una carpeta `components/` global

Una carpeta global de componentes crece hasta tener cientos de archivos sin relación. Con feature-first, cada funcionalidad es autocontenida y se puede revisar, mover o eliminar sin buscar sus archivos por todo el proyecto.

## 6. Librerías compartidas

```text
libs/shared/domain/src/lib/
├─ enums.ts       # Enums de dominio (estados, roles, tipos)
├─ models.ts      # Modelos de lectura
└─ contracts.ts   # Contratos de request/response del API

libs/shared/utils/src/lib/
├─ dates.ts       # Utilidades de fecha
├─ format.ts      # Formato de moneda COP
├─ labels.ts      # Etiquetas legibles
└─ geo.ts         # Haversine / distancias
```

Se importan con los aliases definidos en `tsconfig.base.json`:

```ts
import { BookingStatus } from '@canchalibre/shared-domain';
import { formatCop } from '@canchalibre/shared-utils';
```

**Reglas:**

- Solo TypeScript puro. Sin `@angular/*`, `@nestjs/*` ni `@ionic/*`.
- Sin efectos secundarios ni acceso a `window`, `document` o `localStorage`.
- Si una utilidad necesita una dependencia de framework, vive en la app, no en `libs/shared`.

## 7. Boundaries entre proyectos

Los proyectos tienen tags en su `project.json`:

| Proyecto | Tags |
| --- | --- |
| `api` | `scope:api`, `type:app` |
| `front` | `scope:front`, `type:app` |
| `movil` | `scope:movil`, `type:app` |
| `shared-domain` | `scope:shared`, `type:domain` |
| `shared-utils` | `scope:shared`, `type:utils` |

`eslint.config.mjs` aplica estas reglas:

```text
scope:shared  → solo puede depender de scope:shared
scope:api     → scope:shared + scope:api
scope:front   → scope:shared + scope:front
scope:movil   → scope:shared + scope:movil
```

En la práctica:

- `front` **no puede** importar `movil` ni `api`.
- `movil` **no puede** importar `front` ni `api`.
- `api` **no puede** importar código de los frontends.
- Las librerías compartidas **no pueden** importar ninguna app.

Referencia: [Nx — Enforce module boundaries](https://nx.dev/features/enforce-module-boundaries).

## 8. Cómo agregar una funcionalidad

### Backend

```bash
npx nx g @nx/nest:module apps/api/src/modules/<dominio> --project=api
```

O crear manualmente:

```text
apps/api/src/modules/<dominio>/
├─ <dominio>.controller.ts
├─ <dominio>.service.ts
├─ <dominio>.module.ts
├─ dto/
└─ entities/
```

Luego registrar el módulo en `apps/api/src/app/app.module.ts`.

### Front web o móvil

```text
apps/<front|movil>/src/app/features/<feature>/
├─ pages/          # Componentes de página (routables)
├─ components/     # Componentes propios del feature
├─ services/       # Estado y llamadas al API del feature
├─ models/         # Tipos exclusivos del feature
└─ <feature>.routes.ts
```

Luego registrar la ruta lazy en `app.routes.ts`:

```ts
{
  path: 'explore',
  loadChildren: () =>
    import('./features/explore/explore.routes').then((m) => m.EXPLORE_ROUTES),
}
```

### Código compartido

Si el código se usa en `front` **y** `movil`, va a `libs/shared/`. Si solo lo usa una app, se queda en esa app.

## 9. Convenciones de nombres

| Tipo | Convención | Ejemplo |
| --- | --- | --- |
| Archivos Angular | `kebab-case` con sufijo | `booking-card.component.ts` |
| Clases | `PascalCase` | `BookingCardComponent` |
| Servicios | `<Dominio>Service` | `BookingsService` |
| Guards | `<nombre>.guard.ts` | `auth.guard.ts` |
| Interceptores | `<nombre>.interceptor.ts` | `jwt.interceptor.ts` |
| Módulos NestJS | `<dominio>.module.ts` | `bookings.module.ts` |
| DTOs | `<accion>-<dominio>.dto.ts` | `create-booking.dto.ts` |
| Entidades | `<nombre>.entity.ts` | `booking.entity.ts` |
| Librerías | `shared-<tipo>` | `shared-domain` |

## 10. Evolución prevista

La estructura actual es deliberadamente simple. Cuando el proyecto crezca:

1. **Extraer features a librerías** si dos apps necesitan la misma pantalla o el mismo estado.
2. **Separar `data-access` de `ui`** dentro de una lib si la lógica de API se vuelve compleja.
3. **Agregar `libs/api/<dominio>`** si el backend necesita compartir servicios entre módulos.
4. **Evaluar microservicios** solo cuando un dominio tenga un ciclo de despliegue o escalado claramente distinto.

No se debe crear una lib por adelantado: una lib sin consumidores agrega mantenimiento sin beneficio.
