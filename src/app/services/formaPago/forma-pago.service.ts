import { httpResource, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormaPago } from '../../interfaces/forma-pago.interface';
import { API_CONFIG } from '../../config/api.config';
import { Response } from '../../interfaces/response.interface';

@Injectable({
  providedIn: 'root',
})
export class FormaPagoService {

  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.formaPago}`;

  private formaPagoResource = httpResource<Response<FormaPago[] | null>>(() => ({
    url: this.API_URL,
  }));

  readonly formasPago = this.formaPagoResource.asReadonly();

  recargar(): void {
    this.formaPagoResource.reload();
  }

  crear(data: Omit<FormaPago, 'id'>) {
    return this.http.post<Response<FormaPago>>(this.API_URL, data);
  }

  editar(id: number, data: Omit<FormaPago, 'id'>) {
    return this.http.put<Response<FormaPago>>(`${this.API_URL}/${id}`, data);
  }

  toggle(id: number) {
    return this.http.put<Response<FormaPago>>(`${this.API_URL}/${id}/toggle`, {});
  }

  limpiar(): void {
    this.formaPagoResource.reload();
  }
}