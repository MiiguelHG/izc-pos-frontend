import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { BoletoTipo } from '../../interfaces/boleto-tipo.interface';
import { API_CONFIG } from '../../config/api.config';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { BoletoBaseService } from '../boletoBase/boleto-base.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class BoletosService {
  private http = inject(HttpClient);
  private boletoBaseService = inject(BoletoBaseService);
  private toast = inject(ToastService);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.boletoTipos}`;

  readonly esEspecial = signal<string>('false');
  private page = signal<number>(1);
  private boletosTiposResourse = httpResource<Response<ListaElementos<BoletoTipo> | null>>(() => ({
    url: this.apiUrl,
    params: {
      esEspecial: this.esEspecial(),
      page: this.page(),
    }
  }));

  readonly boletosTipos = this.boletosTiposResourse.asReadonly();

  createBoletoTipo(boletoTipo: BoletoTipo) {
    this.http.post<Response<BoletoTipo>>(this.apiUrl, boletoTipo).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
        this.toast.showSuccess(res.message || 'Tipo de boleto creado correctamente');
      },
      error: (err) => {
        console.error('Error creating BoletoTipo:', err);
        this.toast.showError(err.error?.message || 'Error al crear el tipo de boleto');
      },
    });
  }

  updateBoletoTipo(id: number, boletoTipo: BoletoTipo) {
    this.http.put<Response<Boolean | null>>(`${this.apiUrl}/${id}`, boletoTipo).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
        this.toast.showSuccess(res.message || 'Tipo de boleto actualizado correctamente');
      },
      error: (err) => {
        console.error('Error updating BoletoTipo:', err);
        this.toast.showError(err.error?.message || 'Error al actualizar el tipo de boleto');
      },
    });
  }

  updatePrecioBoletos(precioEstandar: number, articuloId: number) {
    this.http.put<Response<null>>(`${this.apiUrl}/update-all`, {
      articuloId,
      precioEstandar,
    }).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
        this.boletoBaseService.actualizarBoletosBase();
        this.toast.showSuccess(res.message || 'Precio base actualizado correctamente');
      },
      error: (err) => {
        console.error('Error updating precio base:', err);
        this.toast.showError(err.error?.message || 'Error al actualizar el precio base');
      },
    });
    
  }

  toggleBoletoTipo(id: number) {
    this.http.put<Response<boolean | null>>(`${this.apiUrl}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
        this.toast.showSuccess(res.message || 'Estado del tipo de boleto actualizado correctamente');
      },
      error: (err) => {
        console.error('Error toggling BoletoTipo:', err);
        this.toast.showError(err.error?.message || 'Error al actualizar el estado del tipo de boleto');
      },
    });
  }

  setPage(page: number) {
    this.page.set(page);
    this.boletosTiposResourse.reload();
  }
}