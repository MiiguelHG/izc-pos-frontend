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

  // endpoint general (admin)
  private ARTICULOS_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museoArticulos}`;

  // endpoint relación museo-artículo
  private MUSEO_ARTICULOS_URL =
    `${API_CONFIG.baseUrl}/museo-has-articulos`;

  currentPage = signal<number>(1);
  tipoArticulo = signal<string>('');
  museoId = signal<number | null>(null);

  //BOLETOS (admin)
  private boletoEstandarResource = httpResource<Response<Articulo[] | null>>(() => ({
    url: `${this.ARTICULOS_URL}/tipo/boleto`,
  }));

  readonly boletoEstandar = this.boletoEstandarResource.asReadonly();

  /*ARTÍCULOS (admin)*/
  private articulosResource =
    httpResource<Response<ListaElementos<Articulo> | null>>(() => ({
      url: this.ARTICULOS_URL,
      params: {
        page: this.currentPage(),
        tipo: this.tipoArticulo(),
      },
    }));

  readonly articulos = this.articulosResource.asReadonly();

  //PRODUCTOS (OPERADOR)
  private productosResource =
    httpResource<Response<any>>(() => {
      const museoId = this.museoId();
      if (!museoId) return;

      return {
        url: `${this.MUSEO_ARTICULOS_URL}/museo/${museoId}/articulos/producto`,
        params: {
          page: this.currentPage(),
        },
      };
    });

  readonly productos = this.productosResource.asReadonly();

  recargarProductos() {
    this.productosResource.reload();
  }

  //CRUD ADMIN
  createArticulo(articulo: Articulo) {
    this.http.post<Response<Articulo>>(this.ARTICULOS_URL, articulo).subscribe({
      next: () => this.articulosResource.reload(),
      error: (err) => console.error('❌ Error al crear artículo', err.error),
    });
  }

  editArticulo(articuloId: number, articulo: Articulo) {
    this.http.put(`${this.ARTICULOS_URL}/${articuloId}`, articulo).subscribe({
      next: () => this.articulosResource.reload(),
      error: (err) => console.error('❌ Error al editar artículo', err.error),
    });
  }
}
