import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { User } from '../../interfaces/user.interface';
import { API_CONFIG } from '../../config/api.config';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.usuarios}`;
  readonly currentPage = signal<string>('1');

  private readonly usuariosResource = httpResource<Response<ListaElementos<User>>>(
    () => {
      // Reactivo al usuario logueado — recarga automáticamente al cambiar de cuenta
      const user = this.authService.user();
      if (!user) return undefined;

      return {
        url: this.API_URL,
        params: {
          page: this.currentPage(),
        }
      };
    }
  );

  readonly usuarios = this.usuariosResource.asReadonly();

  updateUsuario(id: number, usuario: Partial<User>): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}`, usuario).subscribe({
      next: (res) => {
        console.log('Usuario actualizado:', res);
        this.usuariosResource.reload();
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err.error);
      }
    });
  }

  reloadUsuarios(): void {
    this.usuariosResource.reload();
  }

  setPage(page: string): void {
    this.currentPage.set(page);
  }


  toggleUsuarioActivo(id: number): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        console.log('Estado del usuario actualizado:', res);
        this.usuariosResource.reload();
      },
      error: (err) => {
        console.error('Error al actualizar estado del usuario:', err.error);
      }
    });
  }



}
