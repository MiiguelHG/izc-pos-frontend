import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Response as Res } from '../../interfaces/response.interface';
import { Visitante } from '../../interfaces/visitante.interface';
import { InformeVisitante } from '../../interfaces/informe-visitante.interface';

@Injectable({
  providedIn: 'root',
})
export class InformesService {
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.informes}`;
  private http = inject(HttpClient);

  private informeResourse = signal<Res<{count: number, data: Visitante}> | null>(null);

  readonly informe = this.informeResourse.asReadonly();
  
  getInformeVisitantes(informeParams: InformeVisitante, tipo: 'visitantes' | 'ingresos') {
    let params = new HttpParams();
    Object.entries(informeParams).forEach(([key, value]) => {
        params = params.set(key, value.toString());
    });

    this.http.get<Res<{count: number, data:Visitante }> | null>(`${this.API_URL}/${tipo}`, { params }).subscribe({
      next: (res) => {
        this.informeResourse.set(res);
      },
      error: (error) => {
        console.error('Error fetching informe visitantes:', error.error?.message);
        this.informeResourse.set(null);
      }
    });
  }
  
}
