import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreenComponent } from '../../components/splash-screen/splash-screen.component';

@Component({
  selector: 'cl-splash-page',
  imports: [SplashScreenComponent],
  templateUrl: './splash.page.html',
})
export class SplashPage {
  private readonly router = inject(Router);

  protected onFinished(): void {
    void this.router.navigateByUrl('/login');
  }
}
