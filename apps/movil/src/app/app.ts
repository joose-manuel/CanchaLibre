import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

/**
 * Shell de la aplicación móvil (Ionic + Capacitor).
 * La estructura de features vive en `src/app/features`.
 * No agregar lógica de negocio aquí.
 */
@Component({
  imports: [IonApp, IonRouterOutlet],
  selector: 'cl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
