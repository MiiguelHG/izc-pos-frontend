import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { Museo } from '../../interfaces/museo.interface';
import { forkJoin } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class SelectMuseos {

  private http = inject(HttpClient);
  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}/all`;

  readonly museos = signal<Museo[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadMuseos(): void {
    this.isLoading.set(true);
    this.http.get<Response<Museo[]>>(this.API_URL)
      .subscribe({
        next: (res) => {
          this.museos.set(res.data ?? []);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar museos:', err);
          this.isLoading.set(false);
        }
      });
  }

}