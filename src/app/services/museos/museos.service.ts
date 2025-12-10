import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { Museo } from '../../interfaces/museo.interface';

@Injectable({
  providedIn: 'root',
})
export class MuseosService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/museos';

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

    // readonly museoResourseById = httpResource<Response<Museo>>(() => `${this.API_URL}/${this.idMuseo()}`);

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

  deleteMuseo(id: number): void {
    this.http.delete<Response<Boolean>>(`${this.API_URL}/${id}`).subscribe({
      next: (res) => {
        this.museosResource.reload();
      },
      error: (err) => {
        console.error('Error deleting museo:', err);
      }
    });
  }
}
