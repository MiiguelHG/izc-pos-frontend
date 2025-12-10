import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { EmitirBoleto } from '../../interfaces/emitir-boleto.interface';
import { Response } from '../../interfaces/response.interface';
import { BoletoEmitidoInfo } from '../../interfaces/boleto-emitido-info.interface';
import { ListaElementos } from '../../interfaces/lista-elementos.interface';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BoletoEmitidoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private user = this.authService.user;

  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.boletosEmitidos}/museo/${this.user()?.museoId}`;

  readonly currentPage = signal<string>('1');
  private currentBoletoEmitidoResource = signal<BoletoEmitidoInfo | null>(null);

  private boletosEmitidosResource = httpResource<Response<ListaElementos<BoletoEmitidoInfo> | null>>(() => ({
    url: this.apiUrl,
    params: {
      page: this.currentPage(),
    }
  }));

  readonly currentBoletoEmitido = this.currentBoletoEmitidoResource.asReadonly();
  readonly boletosEmitidos = this.boletosEmitidosResource.asReadonly();

  emitirBoletoVenta(carrrito: EmitirBoleto):void {
    this.http.post<Response<BoletoEmitidoInfo | null>>(this.apiUrl, carrrito).subscribe({
      next: (res) => { 
        if (res.data) {
          this.currentBoletoEmitidoResource.set(res.data);
          console.log('Boleto emitido exitosamente: ', res)
          this.boletosEmitidosResource.reload();
        }
       },
      error: (err) => { 
        console.error('Error al emitir boleto:', err.error);
      }
    })
  }

  clearCurrentBoletoEmitido(): void {
    this.currentBoletoEmitidoResource.set(null);
  }
}
