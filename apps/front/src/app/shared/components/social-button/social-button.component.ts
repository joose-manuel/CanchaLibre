import { Component, input, output } from '@angular/core';
import { SocialProvider } from '../../interfaces/social-provider.interface';

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

const PROVIDER_ICONS: Record<SocialProvider, string> = {
  google: 'pi pi-google',
  apple: 'pi pi-apple',
};

@Component({
  selector: 'cl-social-button',
  templateUrl: './social-button.component.html',
  styleUrl: './social-button.component.scss',
})
export class SocialButtonComponent {
  readonly provider = input.required<SocialProvider>();
  readonly pressed = output<SocialProvider>();

  protected label(): string {
    return PROVIDER_LABELS[this.provider()];
  }

  protected icon(): string {
    return PROVIDER_ICONS[this.provider()];
  }
}
