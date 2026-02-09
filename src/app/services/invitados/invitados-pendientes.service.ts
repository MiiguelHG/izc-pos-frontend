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

  private invitadosNotificacionResourse = httpResource<Response<{ data: Invitado[], meta: { totalItems: number } }>>(
    () => ({
      url: `${this.API_URL}/sin-ingreso`,
    })
  );
  
  private invitadoResource = signal<Response<Invitado> | null>(null);
  
  readonly invitadosNotificacion = this.invitadosNotificacionResourse.asReadonly();
  readonly invitado = this.invitadoResource.asReadonly();

  
  getInvitadoById(invitadoId: number): void {
    this.http.get<Response<Invitado>>(`${this.API_URL}/${invitadoId}`).subscribe({
      next: (data) => {
        // Actualizara el signal del invitado con la informacion obtenida
        this.invitadoResource.set(data);
      },
      error: (error) => {
        console.error('Error fetching invitado:', error);
      },
    });
  }
}
