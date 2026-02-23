import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  protected readonly isLoading = signal(false);
  
  protected user = this.authService.user;
  protected authError = this.authService.authError;
  
  protected readonly loginForm = this.formBuilder.group({
    email: ['', [ Validators.required, Validators.email ]],
    password: ['', Validators.required],
  });

  constructor() {
    afterNextRender(() => {
      initFlowbite();
    });

    // Effect que reacciona automáticamente cuando el usuario se autentica
    effect(() => {
      const currentUser = this.user();
      const currentAuthError = this.authError();

      if (currentAuthError || currentUser) {
        this.isLoading.set(false);
      }

      if (currentUser) {
        this.authService.resetAuthError();
        const role = currentUser.rol.nombre;
        if (role === 'operador') {
          this.router.navigate(['/operador']);
        } else {
          this.router.navigate(['/admin']);
        }
      }
      
    });
  }

  onLogin(): void {
    this.authService.resetAuthError();
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

}
