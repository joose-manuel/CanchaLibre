import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OwnedVenueView } from '../../pages/registrar-cancha/interfaces/registrar-cancha.interface';

/**
 * Tarjeta de una sede propia en la lista "Mis Canchas".
 */
@Component({
  selector: 'cl-venue-card',
  templateUrl: './venue-card.component.html',
  styleUrl: './venue-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueCardComponent {
  readonly venue = input.required<OwnedVenueView>();

  readonly edit = output<OwnedVenueView>();
  readonly manage = output<OwnedVenueView>();
}
