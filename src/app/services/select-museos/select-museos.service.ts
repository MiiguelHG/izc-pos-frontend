import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { Museo } from '../../interfaces/museo.interface';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectMuseos {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/museos';

  readonly museos = signal<Museo[]>([]);
  readonly isLoading = signal<boolean>(false);//Cargar museos cuando se esta en+ el select 

  private loaded = false;

  loadMuseos(): void {
    if (this.loaded) return; // Evita recargar si ya se han cargado los museos
    this.isLoading.set(true);
    this.http.get<Response<ListaElementos<Museo>>>(this.API_URL, { params: { page: '1' } })
      .subscribe(primerRes => {
        const totalPages    = primerRes.data?.meta?.totalPages ?? 1;

        if (totalPages <= 1) {
          this.museos.set(primerRes.data?.data ?? []);
          this.isLoading.set(false);
          this.loaded = true;
          return;
        }
        const requests = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.http.get<Response<ListaElementos<Museo>>>(this.API_URL, { params: { page: i + 2 } })
        );

        forkJoin(requests).subscribe(responses => {
          const todosMuseos = [...(primerRes.data?.data ?? []), ...responses.flatMap(res => res.data?.data ?? [])];
          this.museos.set(todosMuseos);
          this.isLoading.set(false);
          this.loaded = true;
        });
      });

  }
}








