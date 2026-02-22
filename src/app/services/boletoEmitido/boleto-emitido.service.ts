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

  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.boletosEmitidos}`;

  readonly currentPage = signal<string>('1');
  private currentBoletoEmitidoResource = signal<BoletoEmitidoInfo | null>(null);
  private errorBoletoEmitidoResource = signal<string | null>(null);

  private boletosEmitidosByMuseoResource = httpResource<Response<ListaElementos<BoletoEmitidoInfo> | null>>(() => ({
    url: this.apiUrl,
    params: {
      page: this.currentPage(),
    }
  }));

  private boletoEmitidoId = signal<number | null>(null);
  private boletoEmitidoInfoByIdResource = httpResource<Response<BoletoEmitidoInfo | null>>(() => {
    const id = this.boletoEmitidoId();
    if (!id) {
      return undefined;
    }
    return {
      url: `${this.apiUrl}/${id}`,
    };
  });

  readonly currentBoletoEmitido = this.currentBoletoEmitidoResource.asReadonly();
  readonly boletosEmitidosByMuseo = this.boletosEmitidosByMuseoResource.asReadonly();
  readonly boletoEmitidoInfoById = this.boletoEmitidoInfoByIdResource.asReadonly();
  readonly errorBoletoEmitido = this.errorBoletoEmitidoResource.asReadonly();

  emitirBoletoVenta(carrrito: EmitirBoleto):void {
    this.http.post<Response<BoletoEmitidoInfo | null>>(this.apiUrl, carrrito).subscribe({
      next: (res) => { 
        if (res.data) {
          this.currentBoletoEmitidoResource.set(res.data);
          this.boletosEmitidosByMuseoResource.reload();
        }
       },
      error: (err) => { 
        console.error('Error al emitir boleto:', err.error);
        this.errorBoletoEmitidoResource.set(err.error?.message || 'Error al emitir boleto');
      }
    })
  }

  clearCurrentBoletoEmitido(): void {
    this.currentBoletoEmitidoResource.set(null);
  }

  setBoletoEmitidoId(id: number): void {
    this.boletoEmitidoId.set(id);
    this.boletoEmitidoInfoByIdResource.reload();
  }

  clearBoletoEmitidoInfoById(): void {
    this.boletoEmitidoId.set(null);
    this.boletoEmitidoInfoByIdResource.reload();
  }

  clearError(): void {
    this.errorBoletoEmitidoResource.set(null);
  }
}
