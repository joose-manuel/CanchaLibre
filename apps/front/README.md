# Front — CanchaLibre Web

Shell de la aplicación web / PWA de CanchaLibre. Construido con **Angular 21 standalone**, **SCSS** y rutas diferidas.

> **Estado actual:** scaffold. La estructura de carpetas, el tema base y el bootstrap están listos, pero **no hay pantallas ni lógica de negocio**. No se debe desarrollar funcionalidad en esta etapa.

## Stack

| Pieza | Versión / herramienta |
| --- | --- |
| Framework | Angular 21 standalone |
| Build | `@angular/build:application` (esbuild) |
| Estilos | SCSS + tokens CSS |
| HTTP | `provideHttpClient()` |
| Rutas | `provideRouter()` con lazy loading |
| Puerto de desarrollo | `4200` |
| Salida de build | `dist/apps/front/browser` |

## Estructura

```text
apps/front/
├─ public/                     # Assets estáticos (favicon, imágenes)
├─ src/
│  ├─ index.html
│  ├─ main.ts                   # bootstrapApplication
│  ├─ styles.scss               # Estilos globales + tokens
│  ├─ theme/
│  │  └─ _tokens.scss           # Variables de marca
│  └─ app/
│     ├─ app.ts                 # Componente raíz (solo <router-outlet />)
│     ├─ app.html
│     ├─ app.scss
│     ├─ app.config.ts          # Providers globales
│     ├─ app.routes.ts          # Rutas raíz
│     ├─ core/                  # Guards, interceptores, servicios singleton
│     │  ├─ guards/
│     │  ├─ interceptors/
│     │  └─ services/
│     ├─ shared/                # UI reutilizable sin estado de negocio
│     │  ├─ components/
│     │  ├─ directives/
│     │  └─ pipes/
│     ├─ features/              # Una carpeta por funcionalidad
│     │  ├─ auth/
│     │  ├─ onboarding/
│     │  ├─ explore/
│     │  ├─ match-create/
│     │  ├─ booking/
│     │  ├─ profile/
│     │  └─ owner/
│     └─ layout/                # Shell visual (header, sidebar, footer)
├─ project.json                 # Targets Nx: build, serve, typecheck, lint
├─ tsconfig.app.json
├─ tsconfig.json
└─ eslint.config.mjs
```

Las carpetas vacías contienen un `.gitkeep` para que Git las conserve hasta que se agregue el primer archivo.

## Comandos

Desde la raíz del workspace:

```bash
npm run front                # Servidor de desarrollo en http://localhost:4200
npm run build:front          # Build de producción
npx nx typecheck front       # Verificación de tipos
npx nx lint front            # ESLint
```

## Convenciones

### Componentes

- Todos los componentes son **standalone**; no se usan `NgModule`.
- Selector con prefijo `cl` (`cl-booking-card`).
- Archivos en `kebab-case` con sufijo: `booking-card.component.ts`.
- Componentes de página en `features/<feature>/pages/`.
- Componentes internos del feature en `features/<feature>/components/`.
- Componentes reutilizables entre features en `shared/components/`.

### Estado y datos

- Servicios de infraestructura (auth, HTTP, storage) en `core/services/`.
- Servicios de un feature en `features/<feature>/services/`.
- Los modelos compartidos con el API se importan de `@canchalibre/shared-domain`.
- Las utilidades puras se importan de `@canchalibre/shared-utils`.

### Rutas

- `app.routes.ts` solo contiene rutas raíz y `loadChildren`/`loadComponent`.
- Cada feature expone sus rutas en `features/<feature>/<feature>.routes.ts`.
- Las páginas se cargan de forma diferida para mantener pequeño el bundle inicial.

### Estilos

- Tokens globales en `src/theme/_tokens.scss`.
- Estilos de componente en su propio `.scss`.
- Evitar estilos globales nuevos; preferir tokens y clases utilitarias.

## Dónde va cada cosa

| Necesidad | Ubicación |
| --- | --- |
| Guard de autenticación | `src/app/core/guards/auth.guard.ts` |
| Interceptor JWT | `src/app/core/interceptors/jwt.interceptor.ts` |
| Servicio de sesión | `src/app/core/services/auth.service.ts` |
| Botón reutilizable | `src/app/shared/components/button/` |
| Pipe de moneda COP | `src/app/shared/pipes/currency-cop.pipe.ts` |
| Pantalla de explorar canchas | `src/app/features/explore/pages/` |
| Servicio del feature de reservas | `src/app/features/booking/services/` |
| Header / sidebar | `src/app/layout/` |

## Relación con el móvil

`front` y `movil` son **dos shells distintos** sobre el mismo dominio. No comparten componentes de UI porque la experiencia web y la táctil difieren, pero sí comparten:

- Tipos, enums y contratos (`@canchalibre/shared-domain`).
- Utilidades puras (`@canchalibre/shared-utils`).
- El contrato del API.

Si en el futuro una pantalla debe ser idéntica en web y móvil, se extrae a una librería de UI compartida; no se importa código de `apps/movil` desde `apps/front`.

## Estado actual

No hay features implementadas. El único contenido es el shell mínimo (`<router-outlet />`), los providers globales, el tema base y la estructura de carpetas.
