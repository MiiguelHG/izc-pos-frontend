import { computed, inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { HttpClient, httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Articulo } from '../../interfaces/articulo.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ArticulosService {
  private http = inject(HttpClient);
  private API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;
  private toast = inject(ToastService);

  currentPage = signal<string>('1');
  tipoArticulo = signal<string>('');
  search = signal<string>('');

  private params = computed<Record<string, string>>(() => ({
    page: this.currentPage(),
    ...(this.search() ? { search: this.search() } : {}),
    ...(this.tipoArticulo() ? { tipo: this.tipoArticulo() } : {}),
  }));

  private articulosResource = httpResource<Response<ListaElementos<Articulo> | null>>(() => ({
    url: this.API_URL,
    params: this.params(),
  }));

  readonly articulos = this.articulosResource.asReadonly();

  setSearch(search: string) {
    this.search.set(search);
  }

  createArticulo(articulo: Articulo) {
    this.http.post<Response<Articulo>>(`${this.API_URL}`, articulo).subscribe({
      next: (res) => {
        this.toast.showSuccess(res.message || 'Artículo creado correctamente');
        this.articulosResource.reload();
      },
      error: (err) => {
        console.error('Error al crear el artículo:', err.error);
        this.toast.showError(err.error?.message || 'Error al crear el artículo');
      }
    });
  }

  editArticulo(articuloId: number, articulo: Articulo) {
    this.http.put<Response<Boolean>>(`${this.API_URL}/${articuloId}`, articulo).subscribe({
      next: (res) => {
        this.articulosResource.reload();
        this.toast.showSuccess(res.message || 'Artículo actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ Error al editar el artículo:', err.error);
        this.toast.showError(err.error?.message || 'Error al editar el artículo');
      }
    });
  }

  toggleArticulo(articuloId: number) {
    this.http.put<Response<boolean>>(`${this.API_URL}/${articuloId}/toggle`, {})
      .subscribe({
        next: (res) => {
          this.articulosResource.reload();
          this.toast.showSuccess(res.message || 'Estado del artículo actualizado');
        },
        error: (err) => {
          console.error('Error al cambiar estado del artículo:', err.error);
          this.toast.showError(err.error?.message || 'Error al cambiar estado del artículo');
        }
      });
  }

  articulosReload() {
    this.articulosResource.reload();
  }
}