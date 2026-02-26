import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Response as Res } from '../../interfaces/response.interface';
import { Visitante } from '../../interfaces/visitante.interface';
import { InformeVisitante } from '../../interfaces/informe-visitante.interface';
import { TipoInforme } from '../../interfaces/tipo-informe.type';

@Injectable({
  providedIn: 'root',
})
export class InformesService {
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.informes}`;
  private http = inject(HttpClient);

  private informeVisitanteResourse = signal<Res<{count: number, data: {fechaRegistro: string, total: number}[]}> | null>(null);
  private informeErrorResource = signal<string | null>(null);

  readonly informe = this.informeVisitanteResourse.asReadonly();
  readonly informeError = this.informeErrorResource.asReadonly();
  
  getInformeVisitantes(informeParams: InformeVisitante, tipo: TipoInforme) {
    let params = new HttpParams();
    Object.entries(informeParams).forEach(([key, value]) => {
        params = params.set(key, value.toString());
    });

    this.http.get<Res<{count: number, data: {fechaRegistro: string, total: number}[]}> | null>(`${this.API_URL}/${tipo}`, { params }).subscribe({
      next: (res) => {
        this.informeVisitanteResourse.set(res);
      },
      error: (error) => {
        console.error('Error fetching informe visitantes:', error.error?.message);
        this.informeVisitanteResourse.set(null);
        this.informeErrorResource.set(error.error?.message || 'Error desconocido');
      }
    });
  }

  clearInforme() {
    this.informeVisitanteResourse.set(null);
    this.informeErrorResource.set(null);
  }
  
}
