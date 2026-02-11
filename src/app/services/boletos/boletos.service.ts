import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { BoletoTipo } from '../../interfaces/boleto-tipo.interface';
import { API_CONFIG } from '../../config/api.config';
import { ArticulosService } from '../articulos/articulos.service';

export interface Boleto {
  id: number;
  nombre: string;
  price: number;
  discount: number;
  agregado?: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class BoletosService {
  private http = inject(HttpClient);
  private articuloService = inject(ArticulosService);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.boletoTipos}`;

  private boletosTiposResourse = httpResource<Response<BoletoTipo[] | null>>(() => ({
    url: this.apiUrl,
  }));

  readonly esEspecial = signal<string>('false');
  
  private boletosTiposOperadorResourse = httpResource<Response<BoletoTipo[] | null>>(() => ({
    url: `${this.apiUrl}`,
    params: {
      esEspecial: this.esEspecial(),
    }
  }));

  readonly boletosTipos = this.boletosTiposResourse.asReadonly();
  readonly boletosTiposOperador = this.boletosTiposOperadorResourse.asReadonly();

  createBoletoTipo(boletoTipo: BoletoTipo) {
    this.http.post<Response<BoletoTipo>>(this.apiUrl, boletoTipo).subscribe({
      next: (res) => {
        console.log('BoletoTipo created successfully:', res);
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
        console.log('BoletoTipo updated successfully:', res);
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














  // ----------------------------------------------------------------------------------
  boletosAgregados = signal<Boleto[]>([]);
  cantidades = signal<{ [id: number]: number }>({});

  // Agregar boleto a la lista de operaciones
  agregarBoleto(boleto: Boleto) {
    const existe = this.boletosAgregados().find(p => p.id === boleto.id);

    if (!existe) {
      this.boletosAgregados.update(boletos => [...boletos, boleto]);
      this.cantidades.update(cant => ({ ...cant, [boleto.id]: 1 }));
    }
  }

  // Signal para notificar cuando se elimina un boleto
  boletoEliminado = signal<number | null>(null);

  // Eliminar boleto de la lista de operaciones
  eliminarBoleto(boletoId: number) {
    this.boletosAgregados.update(boletos =>
      boletos.filter(p => p.id !== boletoId)
    );

    this.cantidades.update(cant => {
      const nuevasCant = { ...cant };
      delete nuevasCant[boletoId];
      return nuevasCant;
    });

    //el boleto fue eliminado
    this.boletoEliminado.set(boletoId);
    setTimeout(() => this.boletoEliminado.set(null), 100);
  }

  // Metodo Incrementar cantidad
  incrementarCantidad(boletoId: number) {
    const actual = this.cantidades()[boletoId] || 0;
    this.cantidades.update(cant => ({ ...cant, [boletoId]: actual + 1 }));
  }

  //Metodo Decrementar cantidad
  decrementarCantidad(boletoId: number) {
    const actual = this.cantidades()[boletoId] || 0;

    if (actual > 1) {
      this.cantidades.update(cant => ({ ...cant, [boletoId]: actual - 1 }));
    } else if (actual === 1) {
      this.eliminarBoleto(boletoId);
    }
  }

  // Verificar si un boleto está agregado
  estaAgregado(boletoId: number): boolean {
    return this.boletosAgregados().some(p => p.id === boletoId);
  }
}