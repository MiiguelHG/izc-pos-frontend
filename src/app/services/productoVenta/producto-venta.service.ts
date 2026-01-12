import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';
import { Response } from '../../interfaces/response.interface';
import { EmitirProductoVenta } from '../../interfaces/emitir-producto-venta.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { ProductoVenta } from '../../interfaces/producto-venta.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductoVentaService {
  private http = inject(HttpClient);

  
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productoVentas}`;

  //Venta recién creada (para limpiar carrito / navegar)
  private _currentProductoVenta = signal<ProductoVenta | null>(null);
  readonly currentProductoVenta = this._currentProductoVenta.asReadonly();

  //Museo activo (para filtrar ventas)
  readonly museoId = signal<number | null>(null);

  //LISTAR VENTAS DE PRODUCTOS (POR MUSEO)
  private ventasResource = httpResource<
    Response<{
      ventas: ProductoVenta[];
      pagination: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
      };
    }> | null
  >(() => {
    const museoId = this.museoId();

    //No hacer request si no hay museo
    if (!museoId) return;

    return {
      url: `${this.API_URL}/museo/${museoId}`,
      params: {
        offset: 1, 
      },
    };
  });

  //Exponer ventas
  readonly ventas = this.ventasResource.asReadonly();

  //Forzar recarga del listado
  recargarVentas(): void {
    this.ventasResource.reload();
  }

  //EMITIR VENTA DE PRODUCTOS
  emitirProductoVenta(payload: EmitirProductoVenta): void {
    this.http
      .post<Response<ProductoVenta>>(this.API_URL, payload)
      .subscribe({
        next: (res) => {
          console.log('✅ Venta registrada correctamente', res);
          this._currentProductoVenta.set(res.data ?? null);
        },
        error: (err) => {
          console.error('❌ Error al emitir venta de productos', err.error);
        },
      });
  }

  getVentaById(id: number) {
  return this.http.get<Response<ProductoVenta>>(
    `${this.API_URL}/${id}`
  );
}



  //Limpiar venta actual
  clearCurrentProductoVenta(): void {
    this._currentProductoVenta.set(null);
  }
}
