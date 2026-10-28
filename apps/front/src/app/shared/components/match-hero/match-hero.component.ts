import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourtOption } from '../../pages/crear-partido/interfaces/crear-partido.interface';

/**
 * Portada del partido con los datos de la sede (paso 3 del asistente).
 */
@Component({
  selector: 'cl-match-hero',
  templateUrl: './match-hero.component.html',
  styleUrl: './match-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchHeroComponent {
  readonly court = input.required<CourtOption>();
}
