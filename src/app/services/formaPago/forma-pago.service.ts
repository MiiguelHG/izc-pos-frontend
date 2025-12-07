import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormaPago } from '../../interfaces/forma-pago.interface';
import { API_CONFIG } from '../../config/api.config';
import { Response } from '../../interfaces/response.interface';

@Injectable({
  providedIn: 'root',
})
export class FormaPagoService {
  private formaPagoResource = httpResource<Response<FormaPago[] | null>>(() => ({
    url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.formaPago}`,
  }));

  readonly formasPago = this.formaPagoResource.asReadonly();
}
