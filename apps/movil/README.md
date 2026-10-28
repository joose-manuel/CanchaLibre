# Móvil — CanchaLibre Android

Shell de la aplicación móvil de CanchaLibre. Construido con **Angular 21 standalone**, **Ionic 9** y **Capacitor 8**, con proyecto nativo Android incluido.

> **Estado actual:** scaffold. La estructura de carpetas, el tema Ionic y la configuración de Capacitor están listos, pero **no hay pantallas ni lógica de negocio**. No se debe desarrollar funcionalidad en esta etapa.

## Stack

| Pieza | Versión / herramienta |
| --- | --- |
| Framework | Angular 21 standalone |
| UI | Ionic 9 (`@ionic/angular`) |
| Nativo | Capacitor 8 (`@capacitor/core`, `@capacitor/android`) |
| Plugins | App, Preferences, SplashScreen, StatusBar |
| Build | `@angular/build:application` (esbuild) |
| Puerto de desarrollo web | `4201` |
| Salida de build | `dist/apps/movil/browser` |
| App ID Android | `co.canchalibre.app` |

## Estructura

```text
apps/movil/
├─ android/                    # Proyecto nativo generado por Capacitor
│  ├─ app/
│  ├─ gradle/
│  ├─ build.gradle
│  ├─ settings.gradle
│  └─ gradlew / gradlew.bat
├─ public/                     # Assets estáticos
├─ src/
│  ├─ index.html
│  ├─ main.ts                   # bootstrapApplication
│  ├─ styles.scss               # Ionic core + estilos globales
│  ├─ theme/
│  │  └─ variables.scss         # Variables de tema Ionic
│  └─ app/
│     ├─ app.ts                 # Componente raíz (<ion-app>)
│     ├─ app.html               # <ion-router-outlet />
│     ├─ app.scss
│     ├─ app.config.ts          # provideIonicAngular + providers
│     ├─ app.routes.ts          # Rutas raíz
│     ├─ core/                  # Guards, interceptores, servicios singleton
│     │  ├─ guards/
│     │  ├─ interceptors/
│     │  └─ services/
│     ├─ shared/                # Componentes, directivas y pipes reutilizables
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
│     └─ layout/                # Shell visual (tabs, header, menú)
├─ capacitor.config.ts          # appId, webDir, plugins
├─ project.json                 # Targets Nx: build, serve, sync, open, android
├─ tsconfig.app.json
├─ tsconfig.json
└─ eslint.config.mjs
```

Las carpetas vacías contienen un `.gitkeep` para que Git las conserve hasta que se agregue el primer archivo.

## Comandos

Desde la raíz del workspace:

| Comando | Qué hace |
| --- | --- |
| `npm run movil` | Sirve la app en el navegador (`http://localhost:4201`) |
| `npm run movil:sync` | Compila y sincroniza assets/plugins con Android |
| `npm run movil:open` | Abre el proyecto Android en Android Studio |
| `npm run movil:android` | Compila, sincroniza y ejecuta en emulador/dispositivo |
| `npm run movil:add:android` | Regenera `android/` (solo si se borró) |
| `npm run build:movil` | Build de producción del shell web |
| `npx nx typecheck movil` | Verificación de tipos |
| `npx nx lint movil` | ESLint |

## Flujo de desarrollo

### Vista rápida en el navegador

```bash
npm run movil
```

Ionic se comporta como una app web en `http://localhost:4201`. Es la forma más rápida de iterar en UI y no requiere Android SDK.

### Emulador o dispositivo Android

Requisitos:

- **Android Studio** con Android SDK instalado.
- Variable `ANDROID_HOME` o `ANDROID_SDK_ROOT` configurada.
- Un emulador creado (AVD) o un dispositivo con depuración USB activa.
- **Java 21** (el que incluye Android Studio).

```bash
# 1. Compilar y sincronizar
npm run movil:sync

# 2. Ejecutar en el dispositivo/emulador
npm run movil:android
```

También se puede abrir el proyecto nativo y ejecutarlo desde Android Studio:

```bash
npm run movil:open
```

### Regenerar la plataforma Android

La carpeta `android/` se versiona en Git. Solo debe regenerarse si se borró o si se cambió el `appId`:

```bash
npm run movil:add:android
```

> Esto sobrescribe la configuración nativa. No ejecutarlo sin respaldo si se hicieron cambios manuales en `android/`.

## Configuración de Capacitor

`capacitor.config.ts`:

```ts
{
  appId: 'co.canchalibre.app',
  appName: 'CanchaLibre',
  webDir: '../../dist/apps/movil/browser',
  android: { path: 'android' },
  server: { androidScheme: 'https' },
}
```

`webDir` es relativo a `apps/movil`, por eso apunta a `../../dist/apps/movil/browser` (la raíz del workspace).

### Assets generados

Capacitor copia el build web a `android/app/src/main/assets/public/`. Esa carpeta está ignorada por Git y se regenera con `npm run movil:sync`.

## Convenciones

- Componentes **standalone** con prefijo `cl`.
- Componentes de página en `features/<feature>/pages/`.
- Componentes internos del feature en `features/<feature>/components/`.
- Componentes reutilizables en `shared/components/`.
- Servicios de infraestructura en `core/services/`.
- Servicios de un feature en `features/<feature>/services/`.
- Modelos y utilidades compartidas desde `@canchalibre/shared-domain` y `@canchalibre/shared-utils`.
- Usar componentes Ionic (`ion-content`, `ion-button`, `ion-list`, etc.) en lugar de HTML nativo cuando exista equivalente.

## Relación con el front web

`movil` y `front` comparten el mismo dominio, pero tienen shells de UI distintos:

- **Comparten:** tipos, enums, contratos y utilidades puras.
- **No comparten:** componentes de UI ni estado de la aplicación.

No se debe importar código de `apps/front` desde `apps/movil` ni viceversa. Las reglas de Nx lo bloquean.

## Estado actual

No hay features implementadas. El único contenido es el shell mínimo (`<ion-app>` + `<ion-router-outlet />`), los providers de Ionic, el tema base y la estructura de carpetas.
