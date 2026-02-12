import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { Museo } from '../../interfaces/museo.interface';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class MuseosService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}`;
  private API_URL2 = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}/all`;

  readonly currentPage = signal<string>('1');
  // readonly idMuseo = signal<number | null>(null);

  private readonly museosResource = httpResource<Response<ListaElementos<Museo>>>(
    () => ({
      url: this.API_URL,
      params: {
        page: this.currentPage(),
      }
    }));

    readonly museos = this.museosResource.asReadonly();

    readonly allMuseos = signal<Response<Museo[] | null> | null>(null);

    getAllMuseos(): void {
      this.http.get<Response<Museo[]>>(this.API_URL2).subscribe({
        next: (res) => {
          // Aquí puedes manejar la respuesta que contiene la lista de museos
          this.allMuseos.set(res);
        },
        error: (err) => {
          console.error('Error al obtener la lista de museos:', err);
        }
      });
    }

  createMuseo(museo: Museo): void {
    this.http.post<Response<Museo>>(this.API_URL, museo).subscribe({
      next: (res) => {
        this.museosResource.reload();
      },
      error: (err) => {
        console.error('Error creating museo:', err);
      }
    });
  }

  updateMuseo(id: number, updatedMuseo: Museo): void {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${id}`, updatedMuseo).subscribe({
      next: (res) => {
        this.museosResource.reload();
      },
      error: (err) => {
        console.error('Error updating museo:', err);
      }
    });
  }
}
