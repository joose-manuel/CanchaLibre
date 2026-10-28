import { Component, input, output } from '@angular/core';
import { FilterOption } from '../../interfaces/filter-option.interface';

@Component({
  selector: 'cl-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrl: './filter-chips.component.scss',
})
export class FilterChipsComponent {
  readonly options = input.required<FilterOption[]>();
  readonly selected = input('');
  readonly selectedChange = output<string>();
}
