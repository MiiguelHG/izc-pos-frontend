import { Injectable, signal, inject } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';
import { Response } from '../../interfaces/response.interface';
import { Articulo } from '../../interfaces/articulo.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductosCarritoService {

  private http = inject(HttpClient);
  private API_URL =
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museoArticulos}`;

  currentPage = signal<number>(1);
  museoId = signal<number | null>(null);

  // 🔥 SOLO PRODUCTOS
  private productosResource = httpResource<Response<ListaElementos<Articulo> | null>>(() => {
    const museoId = this.museoId();
    if (!museoId) return;

    return {
      url: `${this.API_URL}/museo/${museoId}/articulos/producto`,
      params: {
        page: this.currentPage(),
      },
    };
  });

  readonly productos = this.productosResource.asReadonly();

  recargarProductos(): void {
    this.productosResource.reload();
  }
}