import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ProfileSettingItem,
  ProfileSettingSection,
} from '../../pages/profile/interfaces/profile.interface';

/**
 * Lista de configuración del perfil. Emite `toggleChange` cuando se activa
 * un interruptor y `action` cuando se pulsa una acción.
 */
@Component({
  selector: 'cl-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent {
  readonly sections = input.required<ProfileSettingSection[]>();
  readonly toggleChange = output<{ key: string; value: boolean }>();
  readonly action = output<ProfileSettingItem>();

  protected onToggle(item: ProfileSettingItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.toggleChange.emit({ key: item.key, value: input.checked });
  }
}
