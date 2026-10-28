# API — CanchaLibre

Backend de CanchaLibre construido con **NestJS 11**, **TypeORM** y **PostgreSQL**. Expone una API REST versionada por prefijo (`/api`) y documentación Swagger en `/api/docs`.

## Stack

| Pieza | Versión / herramienta |
| --- | --- |
| Runtime | Node.js 22 |
| Framework | NestJS 11 |
| ORM | TypeORM 0.3 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + guards por rol |
| Validación | `class-validator` + `class-transformer` |
| Documentación | Swagger (`@nestjs/swagger`) |
| Build | Nx + Webpack |

## Estructura

```text
apps/api/
├─ src/
│  ├─ main.ts                  # Bootstrap: prefijo /api, CORS, Helmet, Swagger
│  ├─ app/
│  │  ├─ app.module.ts         # Módulo raíz
│  │  ├─ app.controller.ts
│  │  └─ app.service.ts
│  ├─ common/
│  │  ├─ decorators/           # @Public, @Roles, @CurrentUser
│  │  ├─ filters/              # Filtro global de excepciones
│  │  ├─ guards/               # JwtAuthGuard, RolesGuard
│  │  ├─ interfaces/           # Usuario autenticado
│  │  └─ mappers/              # Mapeo entidad → respuesta
│  ├─ config/
│  │  └─ configuration.ts      # Configuración tipada desde .env
│  ├─ database/
│  │  ├─ data-source.ts        # DataSource para CLI de TypeORM
│  │  ├─ database.module.ts    # TypeOrmModule.forRootAsync
│  │  ├─ entities.ts           # Registro central de entidades
│  │  ├─ seed-data.ts          # Semilla idempotente
│  │  ├─ seed.module.ts
│  │  └─ seed.ts               # Script CLI de semilla
│  └─ modules/                 # Un módulo por dominio
│     ├─ auth/                 # Registro, login, JWT, perfil
│     ├─ users/                # Perfil y actualización de datos
│     ├─ cities/               # Catálogo de ciudades
│     ├─ sports/               # Catálogo de deportes
│     ├─ venues/               # Sedes, políticas y consultas
│     ├─ spaces/               # Espacios, horarios, bloqueos, disponibilidad
│     ├─ matches/              # Partidos, cupos e inscripciones
│     ├─ bookings/             # Reservas, estados y QR de check-in
│     ├─ payments/             # Anticipos y webhook sandbox
│     ├─ notifications/        # Notificaciones de usuario
│     └─ owner/                # Agenda, reservas y finanzas del propietario
├─ project.json                # Targets Nx: build, serve, typecheck
├─ tsconfig.app.json
├─ tsconfig.json
└─ webpack.config.js
```

### Convención de un módulo

```text
modules/<dominio>/
├─ <dominio>.controller.ts     # Rutas HTTP y Swagger
├─ <dominio>.service.ts        # Lógica de negocio
├─ <dominio>.module.ts         # Wiring de TypeORM y dependencias
├─ dto/                        # Entradas validadas
└─ entities/                   # Entidades TypeORM
```

## Comandos

Desde la raíz del workspace:

```bash
npm run back                 # Servidor con recarga en caliente
npm run build:api            # Build de producción
npx nx typecheck api         # Verificación de tipos
npx nx lint api              # ESLint
```

El API queda en:

- REST: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

## Variables de entorno

El API carga `.env.local` y `.env` desde la raíz del workspace (en ese orden). La plantilla está en [`.env.example`](../../.env.example).

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `PORT` | `3000` | Puerto HTTP |
| `CORS_ORIGIN` | `http://localhost:4200,http://localhost:8100` | Orígenes permitidos (coma) |
| `DATABASE_URL` | — | URL completa; tiene prioridad sobre `DB_*` |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Puerto PostgreSQL |
| `DB_USER` | `canchalibre` | Usuario |
| `DB_PASSWORD` | `canchalibre` | Contraseña |
| `DB_NAME` | `canchalibre` | Base de datos |
| `DB_SYNCHRONIZE` | `true` en dev | Crea/actualiza tablas automáticamente |
| `DB_LOGGING` | `false` | Log de consultas SQL |
| `DB_SSL` | `false` | Conexión SSL (producción) |
| `JWT_SECRET` | secreto de desarrollo | **Cambiar en producción** |
| `JWT_EXPIRES_IN` | `7d` | Vigencia del token |
| `PAYMENTS_PROVIDER` | `sandbox` | Proveedor de pagos |
| `PAYMENTS_WEBHOOK_SECRET` | secreto de desarrollo | Firma del webhook |
| `SEED_DATABASE` | `true` en dev | Ejecuta la semilla al arrancar |
| `SEED_DEMO_DATA` | `true` en dev | Incluye datos demo |

## Base de datos

### Levantar PostgreSQL con Docker

```bash
npm run db:up
npm run db:logs
```

El `docker-compose.yml` de la raíz crea la base `canchalibre` con usuario y contraseña `canchalibre` en el puerto `5432`.

### Semilla

La semilla es **idempotente**: se puede ejecutar varias veces sin duplicar catálogos.

```bash
npm run db:seed
```

Credenciales demo:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Propietario | `owner@canchalibre.co` | `CanchaLibre123*` |
| Jugador | `player@canchalibre.co` | `CanchaLibre123*` |

### Migraciones

En desarrollo el esquema se sincroniza automáticamente (`DB_SYNCHRONIZE=true`). Para producción se recomienda desactivarlo y usar migraciones:

```bash
# Generar una migración (la carpeta se crea si no existe)
npm run migration:generate -- apps/api/src/database/migrations/InitialSchema

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir la última
npm run migration:revert
```

La configuración de TypeORM para la CLI está en `src/database/data-source.ts` y registra las entidades desde `src/database/entities.ts`.

## Autenticación y roles

- El registro y el login viven en `modules/auth`.
- El token se envía como `Authorization: Bearer <token>`.
- `JwtAuthGuard` es global; las rutas públicas se marcan con `@Public()`.
- `RolesGuard` valida los roles declarados con `@Roles(...)`.
- El usuario autenticado se obtiene con `@CurrentUser()`.

## Estado actual

El backend está completo para el alcance funcional actual y **compila sin errores**. No se deben agregar funcionalidades nuevas en esta etapa; cualquier cambio debe limitarse a correcciones necesarias para compilar o para mantener la coherencia del contrato con los frontends.
