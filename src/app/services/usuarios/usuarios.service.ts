import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
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
  private toast = inject(ToastService);

  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.usuarios}`;
  readonly currentPage = signal<string>('1');
  private search = signal<string>('');

  private readonly usuariosResource = httpResource<Response<ListaElementos<User>>>(
    () => {
      // Reactivo al usuario logueado — recarga automáticamente al cambiar de cuenta
      const user = this.authService.user();
      if (!user) return undefined;

      return {
        url: this.API_URL,
        params: {
          page: this.currentPage(),
          search: this.search()
        }
      };
    }
  );

  readonly usuarios = this.usuariosResource.asReadonly();

  updateUsuario(id: number, usuario: Partial<User>): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}`, usuario).subscribe({
      next: (res) => {
        this.usuariosResource.reload();
        this.toast.showSuccess('Usuario actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err.error);
        this.toast.showError(err.error?.message || 'Error al actualizar usuario');
      }
    });
  }

  reloadUsuarios(): void {
    this.usuariosResource.reload();
  }

  setPage(page: string): void {
    this.currentPage.set(page);
  }

  setSearch(search: string): void {
    this.search.set(search);
  }

  toggleUsuarioActivo(id: number): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        this.usuariosResource.reload();
        this.toast.showSuccess(res.message || 'Estado del usuario actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar estado del usuario:', err.error);
        this.toast.showError(err.error?.message || 'Error al actualizar estado del usuario');
      }
    });
  }
}
