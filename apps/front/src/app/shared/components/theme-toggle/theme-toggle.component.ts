import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

/**
 * Interruptor de tema claro/oscuro.
 *
 * Es un botón (no un switch) porque la acción es un toggle directo: pulsar
 * alterna entre claro y oscuro. `aria-pressed` comunica el estado a los
 * lectores de pantalla.
 */
@Component({
  selector: 'cl-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  protected toggle(): void {
    this.theme.toggle();
  }
}
