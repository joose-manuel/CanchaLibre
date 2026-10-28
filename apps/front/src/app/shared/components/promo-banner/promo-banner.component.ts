import { Component, input, output } from '@angular/core';

@Component({
  selector: 'cl-promo-banner',
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.scss',
})
export class PromoBannerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input('pi pi-trophy');
  readonly pressed = output<void>();
}
