import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell de la aplicación web (PWA).
 * La estructura de features vive en `src/app/features`.
 * No agregar lógica de negocio aquí.
 */
@Component({
  imports: [RouterOutlet],
  selector: 'cl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
