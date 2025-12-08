import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { EmitirBoleto } from '../../interfaces/emitir-boleto.interface';
import { Response } from '../../interfaces/response.interface';
import { BoletoEmitidoInfo } from '../../interfaces/boleto-emitido-info.interface';

@Injectable({
  providedIn: 'root',
})
export class BoletoEmitidoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.boletosEmitidos}`;

  private currentBoletoEmitidoResource = signal<BoletoEmitidoInfo | null>(null);

  readonly currentBoletoEmitido = this.currentBoletoEmitidoResource.asReadonly();

  emitirBoletoVenta(carrrito: EmitirBoleto):void {
    this.http.post<Response<BoletoEmitidoInfo | null>>(this.apiUrl, carrrito).subscribe({
      next: (res) => { 
        if (res.data) {
          this.currentBoletoEmitidoResource.set(res.data);
          console.log('Boleto emitido exitosamente: ', res)
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
