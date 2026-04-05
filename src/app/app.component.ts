import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ZwiftAuthService } from './services/zwift-auth.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, DashboardComponent],
  template: `
    <app-login *ngIf="!authState().isAuthenticated" />
    <app-dashboard *ngIf="authState().isAuthenticated" />
  `,
})
export class AppComponent {
  private authService = inject(ZwiftAuthService);
  authState = toSignal(this.authService.state$, {
    initialValue: this.authService.state,
  });
}
