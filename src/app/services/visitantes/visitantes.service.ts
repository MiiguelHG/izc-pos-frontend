import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Visitante } from '../../interfaces/visitante.interface';
import { Response } from '../../interfaces/response.interface';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class VisitantesService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.visitantes}`;

  private readonly visitenteResourceCreated = signal<Visitante | null>(null);

  visitanteCreated = this.visitenteResourceCreated.asReadonly();

  registrarVisitante(visitante: Visitante): void {

    this.http.post<Response<Visitante | null>>(this.apiUrl, visitante).subscribe({
      next: (res) => {
        console.log('Visitante registrado:', res);
        // Actualizar el signal con el visitante creado si la respuesta es exitosa y contiene datos
        res.data && this.visitenteResourceCreated.set(res.data);
      },
      error: (error) => {
        console.error('Error al registrar visitante:', error.error);
      },
    });
  }

  clearVisitanteCreated(): void {
    this.visitenteResourceCreated.set(null);
  }
}
