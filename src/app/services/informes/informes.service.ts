import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Response as Res } from '../../interfaces/response.interface';
import { InformeVisitante } from '../../interfaces/informe-visitante.interface';
import { InformeIngresos } from '../../interfaces/informe-ingresos.interface';
import { InformeChartData } from '../../interfaces/informe-chart-data.interface';

@Injectable({
  providedIn: 'root',
})
export class InformesService {
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.informes}`;
  private http = inject(HttpClient);

  private informeVisitanteResourse = signal<Res<InformeChartData> | null>(null);
  private informeIngresosResource = signal<Res<InformeChartData> | null>(null);
  private informeErrorResource = signal<string | null>(null);

  readonly informe = this.informeVisitanteResourse.asReadonly();
  readonly informeIngresos = this.informeIngresosResource.asReadonly();
  readonly informeError = this.informeErrorResource.asReadonly();
  
  getInformeVisitantes(informeParams: InformeVisitante) {
    let params = new HttpParams();
    Object.entries(informeParams).forEach(([key, value]) => {
        params = params.set(key, value.toString());
    });

    this.http.get<Res<InformeChartData> | null>(`${this.API_URL}/visitantes`, { params }).subscribe({
      next: (res) => {
        this.informeVisitanteResourse.set(res);
      },
      error: (error) => {
        this.informeVisitanteResourse.set(null);
        this.informeErrorResource.set(error.error?.message || 'Error desconocido');
      }
    });
  }

  getInformeIngresos(informeParams: InformeIngresos) {
    let params = new HttpParams();
    Object.entries(informeParams).forEach(([key, value]) => {
        params = params.set(key, value.toString());
    });

    this.http.get<Res<InformeChartData>>(`${this.API_URL}/ingresos`, { params }).subscribe({
      next: (res) => {
        this.informeIngresosResource.set(res);
      },
      error: (error) => {
        // Aquí podrías manejar el error para el informe de ingresos, similar a como se hace con visitantes
        this.informeIngresosResource.set(null);
        this.informeErrorResource.set(error.error?.message || 'Error desconocido');
      }
    });
  }

  clearInforme() {
    // this.informeVisitanteResourse.set(null);
    // this.informeIngresosResource.set(null);
    this.informeErrorResource.set(null);
  }
  
}
