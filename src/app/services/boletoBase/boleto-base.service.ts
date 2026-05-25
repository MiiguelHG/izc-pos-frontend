import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { Response } from '../../interfaces/response.interface';
import { Articulo } from '../../interfaces/articulo.interface';

@Injectable({
  providedIn: 'root',
})
export class BoletoBaseService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;

  private boletoBaseResource = httpResource<Response<Articulo[] | null>>(() => ({
    url: `${this.API_URL}/tipo/boleto`,
  }));

  readonly boletoBase = computed<Articulo | null>(() => {
    const datos = this.boletoBaseResource.asReadonly().value()?.data;
    return datos && datos.length > 0 ? datos[0] : null;
  });

  actualizarBoletosBase() {
    this.boletoBaseResource.reload();
  }
}
