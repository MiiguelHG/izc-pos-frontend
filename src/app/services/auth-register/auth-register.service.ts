import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';
import { Observable, tap } from 'rxjs';
import { Response } from '../../interfaces/response.interface';
import { CreateUsuario } from '../../interfaces/create-usuario.interface';
import { User } from '../../interfaces/user.interface';
@Injectable({
  providedIn: 'root',
})
export class AuthRegisterService {
  private http = inject(HttpClient);

  private readonly URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}/register`;

  register(userData: CreateUsuario): Observable<Response<{ user: User }>> {
    return this.http.post<Response<{ user: User }>>(this.URL, userData)
      .pipe(tap({
        next: (res) => {
          console.log('Usuario registrado exitosamente:', res);
        },
        error: (err) => {
          console.error('***Error al registrar usuario: ***', err.error);
        }
      })
    );
  }
}
