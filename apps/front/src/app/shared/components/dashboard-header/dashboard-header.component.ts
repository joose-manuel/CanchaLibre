import { Component, input, output } from '@angular/core';
import { UserHeader } from '../../interfaces/user-header.interface';

@Component({
  selector: 'cl-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
})
export class DashboardHeaderComponent {
  readonly user = input.required<UserHeader>();
  readonly greeting = input('Hola');
  readonly avatarPressed = output<void>();
}
