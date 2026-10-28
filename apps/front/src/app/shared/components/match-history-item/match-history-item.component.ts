import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatchHistoryEntry } from '../../pages/profile/interfaces/profile.interface';
import { SportIconComponent } from '../sport-icon/sport-icon.component';

/**
 * Fila del historial de partidos: sede, fecha, deporte, marcador y resultado.
 */
@Component({
  selector: 'cl-match-history-item',
  imports: [SportIconComponent],
  templateUrl: './match-history-item.component.html',
  styleUrl: './match-history-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchHistoryItemComponent {
  readonly entry = input.required<MatchHistoryEntry>();
}
