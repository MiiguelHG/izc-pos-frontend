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

  
  protected readonly message = signal('');
  protected readonly isLoading = signal(false);
  
  protected user = this.authService.user;
  protected response = this.authService.response;
  
  protected readonly loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    afterNextRender(() => {
      initFlowbite();
      // Limpiar el mensaje al montar el componente
      this.message.set('');
    });

    // Effect que reacciona automáticamente cuando el usuario se autentica
    effect(() => {
      const currentResponse = this.response();
      
      if (currentResponse) {
        this.isLoading.set(false);
        
        if (currentResponse.data === null) {
          this.message.set('❌ ' + currentResponse.message);
          return;
        }

        this.message.set('✅ ' + currentResponse.message + ' Redirigiendo...');
        
        const currentUser = this.user();
        if (currentUser) {
          const role = currentUser.rol.nombre;
          if (role === 'operador') {
            this.router.navigate(['/operador']);
          } else {
            this.router.navigate(['/admin']);
          }
        }
      }
    });
  }

  onLogin(): void {
    if (!this.loginForm.valid) {
      this.message.set('❌ Credenciales incompletas.');
      return;
    }
    this.isLoading.set(true);
    this.message.set('');

    const { email, password } = this.loginForm.value;

    // El servicio actualiza userState, lo que dispara el effect() automáticamente
    this.authService.login(email!, password!);
    
    // El effect() se encargará de la navegación cuando isAuthenticated cambie a true
  }

}
