import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZwiftAuthService } from '../../services/zwift-auth.service';
import { AuthState } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(ZwiftAuthService);
  state$: import('rxjs').Observable<AuthState>;

  email = '';
  password = '';
  showPassword = false;

  constructor() {
    this.state$ = this.authService.state$;
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.authService.login(this.email, this.password);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
