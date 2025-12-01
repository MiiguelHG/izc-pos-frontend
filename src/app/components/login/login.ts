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

  protected readonly loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly message = signal('');
  protected readonly isLoading = signal(false);

  protected user = this.authService.user;

  constructor() {
    afterNextRender(() => initFlowbite());

    // Effect que reacciona automáticamente cuando el usuario se autentica
    effect(() => {
      // Solo ejecuta la navegación si está autenticado Y está en proceso de login
      // if (this.authService.isAutenticated() && this.isLoading()) {
      //   this.message.set('✅ Inicio de sesión exitoso. Redirigiendo...');
        
      //   this.isLoading.update(() => false); // Detener el estado de carga
        
      //   // Navegar según el rol del usuario
      //   const currentUser = this.user();
      //   if (currentUser) {
      //     const role = currentUser.rol.nombre;
      //     if (role === 'operador') {
      //       this.router.navigate(['/operador']);
      //     } else {
      //       this.router.navigate(['/admin']);
      //     }
      //   }
      // }

      if (this.user()) {
        this.message.set('✅ Inicio de sesión exitoso. Redirigiendo...');
        this.isLoading.update(() => false); // Detener el estado de carga

        // Navegar según el rol del usuario
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
    this.isLoading.update(() => true);

    const { email, password } = this.loginForm.value;
    this.message.set('');

    // El servicio actualiza userState, lo que dispara el effect() automáticamente
    this.authService.login(email!, password!);
    
    // El effect() se encargará de la navegación cuando isAuthenticated cambie a true
  }

}
