import { Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Estado } from '../../interfaces/estado.interface';
import { CP} from '../../interfaces/cp.interface';

@Injectable({
  providedIn: 'root',
})
export class DipomexService {
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dipomex}`;

  private estadosResource = httpResource<Response<Estado[]>>(() => ({
    url: `${this.apiUrl}/estados`,
  }));
  
  cp = signal<string>('');

  private cpInfoResource = httpResource<Response<CP | null>>(() => {
    const cpValue = this.cp();
    // Solo hacer la petición si el CP tiene 5 dígitos
    if (!cpValue || cpValue.length !== 5) {
      return undefined;
    }
    return {
      url: `${this.apiUrl}/cp/${cpValue}`,
    };
  });

  readonly estados = this.estadosResource.asReadonly();
  readonly cpInfo = this.cpInfoResource.asReadonly();
}
