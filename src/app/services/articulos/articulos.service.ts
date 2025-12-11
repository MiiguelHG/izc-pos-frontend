import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Articulo } from '../../interfaces/articulo.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticulosService {
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;

  private boletoEstandarResource = httpResource<Response<Articulo[] | null>>(() => ({
    url: `${this.API_URL}/tipo/boleto`,
  }));

  readonly boletoEstandar = this.boletoEstandarResource.asReadonly();
}
