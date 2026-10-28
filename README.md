# CanchaLibre

Monorepo [Nx](https://nx.dev) con tres aplicaciones desplegables y dos librerías compartidas para la plataforma de reserva de canchas deportivas.

> **Estado actual:** el backend está implementado y compila. `front` y `movil` son **scaffolds**: tienen la estructura de carpetas, el tema base y la configuración de arranque, pero **sin pantallas ni lógica de negocio** todavía.

## Aplicaciones

| Proyecto | Ruta | Stack | Comando | URL / destino |
| --- | --- | --- | --- | --- |
| `api` | `apps/api` | NestJS 11 + TypeORM + PostgreSQL | `npm run back` | http://localhost:3000/api · Swagger en `/api/docs` |
| `front` | `apps/front` | Angular 21 standalone + SCSS | `npm run front` | http://localhost:4200 |
| `movil` | `apps/movil` | Angular 21 + Ionic 9 + Capacitor 8 | `npm run movil` | http://localhost:4201 (vista web) |
| `movil` (Android) | `apps/movil/android` | Capacitor + Gradle | `npm run movil:android` | Emulador o dispositivo Android |

Las librerías `libs/shared/domain` y `libs/shared/utils` contienen tipos, contratos y utilidades puras reutilizadas por las tres apps.

## Estructura del workspace

```text
CanchaLibre/
├─ apps/
│  ├─ api/                     # Backend NestJS (monolito modular)
│  │  └─ src/
│  │     ├─ app/               # Módulo raíz y bootstrap
│  │     ├─ common/            # Guards, decoradores, filtros, mappers
│  │     ├─ config/            # Configuración tipada por entorno
│  │     ├─ database/          # DataSource, entidades, seed y migraciones
│  │     └─ modules/           # Un módulo por dominio
│  │        ├─ auth/           # Login, registro, JWT
│  │        ├─ users/          # Perfil de usuario
│  │        ├─ cities/         # Catálogo de ciudades
│  │        ├─ sports/         # Catálogo de deportes
│  │        ├─ venues/         # Sedes y políticas
│  │        ├─ spaces/         # Espacios, horarios, bloqueos
│  │        ├─ matches/        # Partidos y cupos
│  │        ├─ bookings/       # Reservas y check-in
│  │        ├─ payments/       # Anticipos y webhook sandbox
│  │        ├─ notifications/  # Notificaciones
│  │        └─ owner/          # Agenda y finanzas del propietario
│  ├─ front/                   # Shell Angular web / PWA
│  │  └─ src/
│  │     ├─ app/
│  │     │  ├─ core/           # Guards, interceptores, servicios singleton
│  │     │  ├─ shared/         # Componentes, directivas y pipes reutilizables
│  │     │  ├─ features/       # Una carpeta por funcionalidad
│  │     │  └─ layout/         # Shell, header, sidebar, footer
│  │     └─ theme/             # Tokens de diseño
│  └─ movil/                   # Shell Ionic + Capacitor para Android
│     ├─ android/              # Proyecto nativo generado por Capacitor
│     └─ src/                  # Misma estructura interna que front
├─ libs/
│  └─ shared/
│     ├─ domain/               # Enums, modelos y contratos compartidos
│     └─ utils/                # Fechas, formato COP, etiquetas, geo
├─ docs/                       # Documentación y material de referencia
├─ nx.json                     # Configuración del workspace
├─ eslint.config.mjs           # Reglas de boundaries entre proyectos
└─ tsconfig.base.json          # Aliases @canchalibre/*
```

### Por qué esta estructura

- **`apps/` contiene solo lo desplegable.** Cada app tiene su propio `project.json`, build y despliegue. `front` y `movil` son dos shells de UI distintos, pero comparten el mismo dominio.
- **`libs/shared/` contiene código sin framework.** `domain` define enums, modelos y contratos; `utils` agrupa funciones puras. Se importan con `@canchalibre/shared-domain` y `@canchalibre/shared-utils`.
- **Feature-first en los frontends.** Cada funcionalidad (`auth`, `explore`, `booking`, etc.) vive en su propia carpeta y se carga de forma diferida. Así se evita una carpeta `components/` gigante y se pueden mover features a librerías cuando crezcan.
- **Monolito modular en el backend.** Cada dominio es un módulo NestJS con su controlador, servicio, DTOs y entidades. Se puede extraer a un servicio independiente sin reescribir la lógica.
- **Boundaries con Nx.** Las reglas de `eslint.config.mjs` impiden que `front` importe código de `movil` o del backend, y que las librerías compartidas dependan de una app.

Más detalle en [`docs/ESTRUCTURA.md`](docs/ESTRUCTURA.md).

## Requisitos

- **Node.js 22+** y npm 10+
- **PostgreSQL 16** o Docker para levantar la base de datos
- **Android Studio + Android SDK** solo si se va a ejecutar la app móvil en un emulador o dispositivo
- **Java 21** (incluido con Android Studio) para compilar el proyecto Android

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno del API
#    Windows (PowerShell)
Copy-Item .env.example .env
#    macOS / Linux
#    cp .env.example .env

# 3. Base de datos (requiere Docker)
npm run db:up

# 4. Backend
npm run back
```

En tres terminales distintas:

```bash
npm run back     # API en http://localhost:3000/api
npm run front    # Web en http://localhost:4200
npm run movil    # Ionic en http://localhost:4201
```

La primera vez que se clone el repositorio, el proyecto Android ya viene incluido en `apps/movil/android`. Si se borra esa carpeta, se regenera con:

```bash
npm run movil:add:android
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run back` | Sirve el API con recarga en caliente |
| `npm run front` | Sirve la app web en el puerto 4200 |
| `npm run movil` | Sirve la app Ionic en el navegador (puerto 4201) |
| `npm run movil:android` | Compila, sincroniza y ejecuta en Android (requiere SDK) |
| `npm run movil:sync` | Compila la app y sincroniza assets/plugins con Android |
| `npm run movil:open` | Abre el proyecto Android en Android Studio |
| `npm run movil:add:android` | Regenera la plataforma Android (solo si se borró) |
| `npm run build` | Build de producción de las tres apps |
| `npm run build:api` | Build de producción del API |
| `npm run build:front` | Build de producción del front web |
| `npm run build:movil` | Build de producción del shell móvil |
| `npm run typecheck` | Verificación de tipos de apps y librerías |
| `npm run lint` | ESLint con reglas de boundaries |
| `npm run db:up` / `db:down` | Levanta / detiene PostgreSQL con Docker |
| `npm run db:seed` | Aplica la semilla de catálogos y datos demo |
| `npm run migration:generate -- <ruta>` | Genera una migración de TypeORM |
| `npm run migration:run` | Ejecuta migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración |

## Variables de entorno

El API lee `.env.local` y `.env` desde la raíz del workspace. Hay una plantilla en [`.env.example`](.env.example). Las variables principales son:

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto del API |
| `CORS_ORIGIN` | `http://localhost:4200,http://localhost:8100` | Orígenes permitidos, separados por coma |
| `DATABASE_URL` | — | Si se define, tiene prioridad sobre `DB_*` |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Conexión PostgreSQL |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `canchalibre` | Credenciales y base de datos |
| `DB_SYNCHRONIZE` | `true` en desarrollo | Sincroniza el esquema automáticamente |
| `JWT_SECRET` | secreto de desarrollo | **Obligatorio cambiarlo en producción** |
| `SEED_DATABASE` / `SEED_DEMO_DATA` | `true` en desarrollo | Semilla de catálogos y demo |

Credenciales demo de la semilla:

- Propietario: `owner@canchalibre.co` / `CanchaLibre123*`
- Jugador: `player@canchalibre.co` / `CanchaLibre123*`

## Ramas

| Rama | Uso |
| --- | --- |
| `dev` | Integración y desarrollo (rama por defecto de Nx) |
| `stg` | Preproducción / QA |
| `main` | Producción |

## Documentación

- [`docs/ESTRUCTURA.md`](docs/ESTRUCTURA.md) — decisiones de arquitectura y convenciones.
- [`apps/api/README.md`](apps/api/README.md) — backend, módulos y base de datos.
- [`apps/front/README.md`](apps/front/README.md) — shell web y organización de features.
- [`apps/movil/README.md`](apps/movil/README.md) — Ionic, Capacitor y Android.
- [`libs/README.md`](libs/README.md) — librerías compartidas y reglas de dependencia.
