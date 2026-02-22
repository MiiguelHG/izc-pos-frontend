import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { BoletoTipo } from '../../interfaces/boleto-tipo.interface';
import { API_CONFIG } from '../../config/api.config';
import { ArticulosService } from '../articulos/articulos.service';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';

@Injectable({
  providedIn: 'root',
})
export class BoletosService {
  private http = inject(HttpClient);
  private articuloService = inject(ArticulosService);
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
      },
      error: (err) => {
        console.error('Error creating BoletoTipo:', err);
      },
    });
  }

  updateBoletoTipo(id: number, boletoTipo: BoletoTipo) {
    this.http.put<Response<Boolean | null>>(`${this.apiUrl}/${id}`, boletoTipo).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
      },
      error: (err) => {
        console.error('Error updating BoletoTipo:', err);
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
        this.articuloService.actualizarBoletosBase();
      },
      error: (err) => {
        console.error('Error updating precio base:', err);
      },
    });
    
  }

  toggleBoletoTipo(id: number) {
    this.http.put<Response<boolean | null>>(`${this.apiUrl}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        this.boletosTiposResourse.reload();
      },
      error: (err) => {
        console.error('Error toggling BoletoTipo:', err);
      },
    });
  }

  setPage(page: number) {
    this.page.set(page);
    this.boletosTiposResourse.reload();
  }
}