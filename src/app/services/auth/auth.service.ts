import { HttpClient, HttpContext } from '@angular/common/http';

import { inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { Login } from '../../interfaces/login.interface';
import { Observable } from 'rxjs';
import { BYPASS_AUTH } from '../../interceptors/index';
import { RefreshToken } from '../../interfaces/refresh-token.interface';
import { User } from '../../interfaces/user.interface';
import { API_CONFIG } from '../../config/api.config';
import { CreateUsuario } from '../../interfaces/create-usuario.interface';
import { UsuariosService } from '../usuarios/usuarios.service';
import type { UsuariosService as UsuariosServiceType } from '../usuarios/usuarios.service'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector); 

  private readonly URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}`;

  private readonly userState = signal<User | null>(null);
  private authErrorMessage = signal<string | null>(null);


  readonly user = this.userState.asReadonly();
  readonly authError = this.authErrorMessage.asReadonly();

  login(email: string, password: string): void {
    this.http.post<Response<Login | null>>(`${this.URL}/login`, { email, password }, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })

    .subscribe({
      next: (res) => {
        console.log('✅ Inicio de sesión exitoso:', res);
        this.saveAccessToken(res.data?.accessToken!);
        this.userState.set(res.data?.user!);
      },
      error: (err) => {
        console.error('❌ Error en el inicio de sesión:', err.error);
        this.authErrorMessage.set(err.error.message || 'Error al iniciar sesión');
        // this.responseState.set(err.error);
      },
    });
  }

  refreshToken(): Observable<Response<RefreshToken>> {
    return this.http.put<Response<RefreshToken>>(`${this.URL}/refresh`, {}, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    });
  }

  logOut(): void {
    this.http.post<Response<null>>(`${this.URL}/logout`, {}, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })

    .subscribe({
      next: (res) => {
        console.log('✅ Cierre de sesión exitoso:', res);
        this.clearAccessToken();
        this.userState.set(null);
      },
      error: (err) => {
        console.error('❌ Error en el cierre de sesión:', err);
      },
    });
  }

  checkSession(): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${this.URL}/me`, {
      withCredentials: true
    });

  }

  initializeSession(): void {
    const token = this.getAccessToken();

    if (!token) {
      return;
    }

    this.checkSession().subscribe({
      next: (res) => {
        console.log('✅ Sesión restaurada:', res);
        this.userState.set(res.data!);
      },
      error: (err) => {
        console.error('❌ Error al restaurar sesión:', err);
        this.clearAccessToken();
        this.userState.set(null);
      },
    });
  }

  saveAccessToken(token: string): void {
    localStorage.setItem('authorization', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('authorization');
  }

  clearAccessToken(): void {
    localStorage.removeItem('authorization');
  }

  resetAuthError(): void {
    this.authErrorMessage.set(null);
  }

  readonly registerError = signal<string | null>(null);

  register(userData: CreateUsuario): void {
    this.registerError.set(null);
    this.http.post<Response<{ user: User }>>(`${this.URL}/register`, userData)
      .subscribe({
        next: (res) => {
          console.log('Usuario registrado:', res);
          runInInjectionContext(this.injector, () => {
            const { UsuariosService } = require('../usuarios/usuarios.service') as { UsuariosService: typeof UsuariosServiceType };
            inject(UsuariosService).reloadUsuarios();
          });
        },
        error: (err) => {
          console.error('Error al registrar:', err.error);
          this.registerError.set(err.error?.message || 'Error desconocido');
        }
      });
  }
}
