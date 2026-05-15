import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { Museo } from '../../interfaces/museo.interface';
import { API_CONFIG } from '../../config/api.config';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class MuseosService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}`;

  readonly currentPage = signal<string>('1');

  private readonly museosResource = httpResource<Response<ListaElementos<Museo>>>(
    () => ({
      url: this.API_URL,
      params: {
        page: this.currentPage(),
      }
    }));

    readonly museos = this.museosResource.asReadonly();

  createMuseo(museo: Museo): void {
    this.http.post<Response<Museo>>(this.API_URL, museo).subscribe({
      next: (res) => {
        this.museosResource.reload();
        this.toast.showSuccess(res.message || 'Museo creado correctamente');
      },
      error: (err) => {
        console.error('Error creating museo:', err);
        this.toast.showError(err.error?.message || 'Error al crear museo');
      }
    });
  }

  updateMuseo(id: number, updatedMuseo: Museo): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}`, updatedMuseo).subscribe({
      next: (res) => {
        this.museosResource.reload();
        this.toast.showSuccess(res.message || 'Museo actualizado correctamente');
      },
      error: (err) => {
        console.error('Error updating museo:', err);
        this.toast.showError(err.error?.message || 'Error al actualizar museo');
      }
    });
  }
}
