import { Component, computed, input, output } from '@angular/core';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { MenuItem, MenuVariant } from '../../interfaces/menu-item.interface';

@Component({
  selector: 'cl-app-menu',
  imports: [BrandLogoComponent],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
})
export class AppMenuComponent {
  readonly items = input.required<MenuItem[]>();
  readonly activeKey = input('');
  readonly variant = input<MenuVariant>('bottom');
  readonly createLabel = input('Crear');
  readonly showCreate = input(true);
  readonly brandName = input('CanchaLibre');
  readonly navigate = output<string>();
  readonly create = output<void>();

  protected readonly leftItems = computed(() => this.items().slice(0, 2));
  protected readonly rightItems = computed(() => this.items().slice(2));
}
