import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { Login } from '../../interfaces/login.interface';
import { Observable, tap } from 'rxjs';
import { BYPASS_AUTH } from '../../interceptors/index';
import { RefreshToken } from '../../interfaces/refresh-token.interface';
import { User } from '../../interfaces/user.interface';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}`;

  private readonly responseState = signal<Response<Login | null> | null>(null);
  private readonly userState = signal<User | null>(null);

  private readonly isLoadingSession = signal<boolean>(true);

  readonly user = this.userState.asReadonly();
  readonly response = this.responseState.asReadonly();

  readonly sessionLoading = this.isLoadingSession.asReadonly();

  login(email: string, password: string): void {
    this.http.post<Response<Login | null>>(`${this.URL}/login`, { email, password }, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })
    .pipe(tap((res) => {
      this.responseState.set(res);

      if (res.data?.accessToken) {
        this.saveAccessToken(res.data.accessToken);
        this.userState.set(res.data.user);
      }

    })).subscribe({
      next: (res) => {
        console.log('✅ Inicio de sesión exitoso:', res);
      },
      error: (err) => {
        console.error('❌ Error en el inicio de sesión:', err.error);
        this.responseState.set(err.error);
      },
    });
  }

  refreshToken(): Observable<Response<RefreshToken>> {
    return this.http.put<Response<RefreshToken>>(`${this.URL}/refresh`, {}, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })
    .pipe(tap((res) => {
      res.data?.accessToken && this.saveAccessToken(res.data.accessToken);
    }))
  }

  logOut(): void {
    this.http.post<Response<null>>(`${this.URL}/logout`, {}, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })
    .pipe(tap(() => {
      this.clearAccessToken();
      this.userState.set(null);
      this.responseState.set(null);
    }))
    .subscribe({
      next: (res) => {
        console.log('✅ Cierre de sesión exitoso:', res);
      },
      error: (err) => {
        console.error('❌ Error en el cierre de sesión:', err);
      },
    });
  }

  checkSession(): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${this.URL}/me`, {
      withCredentials: true
    })
    .pipe(tap((res) => {
      res.data && this.userState.set(res.data);
    }));
  }

  initializeSession(): void {
    const token = this.getAccessToken();
    
    if (!token) {
      this.isLoadingSession.set(false);
      return;
    }

    this.checkSession().subscribe({
      next: (res) => {
        console.log('✅ Sesión restaurada:', res);
        this.isLoadingSession.set(false);
      },
      error: (err) => {
        console.error('❌ Error al restaurar sesión:', err);
        this.clearAccessToken();
        this.isLoadingSession.set(false);
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
}
