import { Component, input, output } from '@angular/core';

@Component({
  selector: 'cl-section-header',
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
