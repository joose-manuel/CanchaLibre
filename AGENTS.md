# AGENTS.md — CanchaLibre



## Reglas de front
- 1 cuando vas acrear un componente nuevo debe que tener una carpeta para constate con susarchivo corresponeidete de ese componente 
- 2 carpeta de interfaz con los tipos en esa interfaz

- 3 carpeta de servicio con su servico logica y consumo de api

- 4 las paguinas bublicas en la carpeta de shared/pages, las paguinas internas de la paguina y las publicas en shared/public las paguinas publicas

- 5 los componente deben que tener input y ouput para que sean reutilizables

- crear un componente clave que para crear tablas y columnas reutlizable que va hacer utilizada en toda las paguina para ahorrar desarrollo ese compoenente verificar si esta, en el caso de no esta crearlo dbe que ser reutilizables con input el cual se va armar la interfaz en ella  


## Workspace

- Nx monorepo. Apps: `api` (NestJS, port 3000), `front` (Angular 21 web/PWA, port 4200), `movil` (Angular 21 + Ionic 9 + Capacitor 8, port 4201).
- Shared TypeScript only: `libs/shared/domain`, `libs/shared/utils`. Aliases `@canchalibre/shared-domain`, `@canchalibre/shared-utils`.
- Boundaries are enforced by `eslint.config.mjs`: `scope:shared` cannot depend on apps; `front` cannot import `movil` or `api`.

## Commands

- Install: `npm install`
- DB: `npm run db:up` (Postgres 16 via Docker)
- API: `npm run back` (reads `.env` / `.env.local`)
- Web: `npm run front`
- Mobile web: `npm run movil`
- Build all: `npm run build`
- Build one: `npm run build:front`, `npm run build:api`, `npm run build:movil`
- Typecheck: `npm run typecheck` or `npx nx typecheck front`
- Lint: `npm run lint` or `npx nx lint front`
- Seed: `npm run db:seed` (demo owner/player: `CanchaLibre123*`)
- Migrations: `npm run migration:generate -- <path>`, `npm run migration:run`, `npm run migration:revert`

## Frontend

- Angular standalone, SCSS, lazy routes. No unit/e2e test runner is configured.
- Reusable UI lives in `apps/front/src/app/shared/components/`. Each component has its own folder and receives data via inputs / emits via outputs.
- Shared menu component: `cl-app-menu` with `variant` input (`bottom` for mobile, `sidebar` for desktop). Responsive variant is resolved by `MediaQueryService` (`shared/services/media-query.service.ts`).
- Page organization: public pages (no session: splash, login, registration) live in `apps/front/src/app/shared/public/`; internal pages (dashboard, etc.) live in `apps/front/src/app/shared/pages/`.
- Static images live in `apps/front/public/images/` and are referenced as `images/<file>`.
- PrimeNG is installed in `front` only: `primeng@21.1.10`, `@primeuix/themes@2.0.3`, `primeicons@8.0.2`, `@angular/cdk@21.2.14`. Theme preset: `apps/front/src/theme/cancha-libre.preset.ts` (Aura-based, blue `#137FEC`).
- Inter is local via `@fontsource-variable/inter`; global font token is `--cl-font-family`.
- Do not install PrimeNG in `movil` until the Ionic-vs-PrimeNG decision is made.
- Mobile stays on Ionic 9 for native shell/navigation unless explicitly changed.

## Backend

- NestJS modular monolith. Each module follows controller/service/module/dto/entities.
- Do not import another module's internal files; use its exported service or shared libs.
- API base: `http://localhost:3000/api`; Swagger at `/api/docs`.

## Codebase graph / MCP

- Project is indexed as `CanchaLibre` with a persistent artifact at `.codebase-memory/graph.db.zst`.
- Prefer MCP graph tools over grep for code discovery. Reindex after significant structural changes.
- If a file is flagged as partially indexed or metadata-changed, read the source directly and qualify claims.

## Conventions

- Files: kebab-case with suffix (`booking-card.component.ts`).
- Selectors: `cl-` prefix.
- Components are standalone; no NgModule.
- Shared libs contain framework-free TypeScript only.
- Do not create a library before it has at least two consumers.
- Branches: `dev` integration, `stg` QA, `main` production.

## Verification

- For frontend changes, run `npm run build:front`, `npx nx lint front`, and `npx nx typecheck front`.
- Use browser automation for visual checks; keep screenshots at mobile and desktop widths.
- There are no automated tests; do not invent test commands.
