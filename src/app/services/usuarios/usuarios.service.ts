import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { User } from '../../interfaces/user.interface';


@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/usuarios';
  readonly currentPage = signal<string>('1');

  private readonly usuariosResource = httpResource<Response<ListaElementos<User>>>(
    () => ({
      url: this.API_URL,
      params: {
        page: this.currentPage(),
      }
    }));

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



}
