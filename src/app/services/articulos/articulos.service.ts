import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Articulo } from '../../interfaces/articulo.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticulosService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;

  currentPage = signal<string>('1');
  tipoArticulo = signal<string>('');

  private boletoEstandarResource = httpResource<Response<Articulo[] | null>>(() => ({
    url: `${this.API_URL}/tipo/boleto`,
  }));

  private articulosResource = httpResource<Response<ListaElementos<Articulo> | null>>(() => ({
    url: this.API_URL,
    params: {
      page: this.currentPage(),
      tipo: this.tipoArticulo(),
    },
  }));

  readonly boletoEstandar = this.boletoEstandarResource.asReadonly();
  readonly articulos = this.articulosResource.asReadonly();

  createArticulo(articulo: Articulo) {
    this.http.post<Response<Articulo>>(`${this.API_URL}`, articulo).subscribe({
      next: (res) => {
        this.articulosResource.reload();
      },
      error: (err) => {
        console.error('❌ Error al crear el artículo:', err.error);
      }
    });
  }

  editArticulo(articuloId: number, articulo: Articulo) {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${articuloId}`, articulo).subscribe({
      next: (res) => {
        this.articulosResource.reload();
      },
      error: (err) => {
        console.error('❌ Error al editar el artículo:', err.error);
      }
    });
  }
}
