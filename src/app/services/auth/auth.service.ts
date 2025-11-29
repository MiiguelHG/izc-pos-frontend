import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { Login } from '../../interfaces/login.interface';
import { Observable, tap } from 'rxjs';
import { BYPASS_AUTH } from '../../interceptors/index';
import { RefreshToken } from '../../interfaces/refresh-token.interface';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly URL = 'http://localhost:3000/api/auth';

  private readonly userState = signal<User | null>(null);

  readonly user = this.userState.asReadonly();

  readonly isAutenticated = computed(() => !!this.userState());

  readonly userName = computed(() => this.userState()?.nombre ?? '');

  readonly userRole = computed(() => this.userState()?.rol.nombre ?? '');

  login(email: string, password: string): void {
    this.http.post<Response<Login>>(`${this.URL}/login`, { email, password }, {
      context: new HttpContext().set(BYPASS_AUTH, true),
      withCredentials: true
    })
    .pipe(tap((res) => {
      res.data?.accessToken && this.saveAccessToken(res.data.accessToken);
      res.data?.user && this.userState.set(res.data.user);
    })).subscribe({
      next: (res) => {
        console.log('✅ Inicio de sesión exitoso:', res);
      },
      error: (err) => {
        console.error('❌ Error en el inicio de sesión:', err);
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
