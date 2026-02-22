import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { Invitado } from '../../interfaces/invitado.interface';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';

@Injectable({
  providedIn: 'root',
})
export class InvitadosService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.invitados}`;

  private page = signal<number>(1);
  private invitadosResourse = httpResource<Response<ListaElementos<Invitado> | null>>(
    () => ({
        url: this.API_URL,
        params: {
          page: this.page()
        }
      })
  );

  readonly invitados = this.invitadosResourse.asReadonly();

  createInvitado(invitado: Invitado): void {
    this.http.post<Response<Invitado>>(this.API_URL, invitado).subscribe({
      next: (data) => {
        // Actualizara la lista de invitados o realizara alguna accion despues de crear el invitado
        this.invitadosResourse.reload();
      },
      error: (error) => {
        console.error('Error creating invitado:', error);
      },
    });
  }

  updateInvitado(invitado: Invitado): void {
    this.http.put<Response<Invitado>>(`${this.API_URL}/${invitado.id}`, invitado).subscribe({
      next: (data) => {
        // Actualizara la lista de invitados o realizara alguna accion despues de actualizar el invitado
        this.invitadosResourse.reload();
      },
      error: (error) => {
        console.error('Error updating invitado:', error);
      },
    });
  }

  cancelarInvitado(invitadoId: number): void {
    this.http.put<Response<boolean>>(`${this.API_URL}/${invitadoId}/cancelar`, {}).subscribe({
      next: (data) => {
        // Actualizara la lista de invitados o realizara alguna accion despues de cancelar el invitado
        this.invitadosResourse.reload();
      },
      error: (error) => {
        console.error('Error canceling invitado:', error);
      },
    });
  }
  
  setPage(page: number) {
    this.page.set(page);
  }
}
