import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Invitado } from '../../interfaces/invitado.interface';

@Injectable({
  providedIn: 'root',
})
export class InvitadosPendientesService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.invitados}`;

  private invitadoId = signal<number | null>(null);
  private museoId = signal<number | null>(null);

  private invitadoResource = httpResource<Response<Invitado | null>>(() => {
    const id = this.invitadoId();
    const museoId = this.museoId();
    if (!id || !museoId) {
      return undefined;
    }
    return {
      url: `${this.API_URL}/${id}/museo/${museoId}`,
    };
  });

  readonly invitado = this.invitadoResource.asReadonly();

  marcarComoUsado(invitadoId: number, boletoEmitidoId: number): void {
    this.http.put<Response<boolean>>(`${this.API_URL}/${invitadoId}/boletoEmitido/${boletoEmitidoId}`, {}).subscribe({
      next: (response) => {
        this.invitadoId.set(null);
        this.museoId.set(null);
      },
      error: (error) => {
        console.error('Error marcando invitado como usado:', error);
      },
    });
  }

  clearInvitado(): void {
    this.invitadoId.set(null);
    this.museoId.set(null);
    this.invitadoResource.reload();
  }
  getInvitacion(invitadoId: number, museoId: number): void {
    this.invitadoId.set(invitadoId);
    this.museoId.set(museoId);
    this.invitadoResource.reload();
  }
}
