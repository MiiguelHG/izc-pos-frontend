import { Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Estado } from '../../interfaces/estado.interface';
import { CP} from '../../interfaces/cp.interface';
import { Municipio } from '../../interfaces/municipio.interface';
import { Pais } from '../../interfaces/pais.interface';

@Injectable({
  providedIn: 'root',
})
export class DipomexService {
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dipomex}`;

  private estadosResource = httpResource<Response<Estado[]>>(() => ({
    url: `${this.apiUrl}/estados`,
  }));
  
  private cp = signal<string | null>(null);

  private cpInfoResource = httpResource<Response<CP | null>>(() => {
    if (!this.cp()) {
      return undefined;
    }
    return {
      url: `${this.apiUrl}/cp/${this.cp()}`,
    };
  });

  private municipioId = signal<number | null>(null);

  private municipiosResource = httpResource<Response<Municipio[]>>(() => {
    // Lógica para obtener municipios
    if (!this.municipioId()) {
      return undefined;
    }
    return {
      url: `${this.apiUrl}/municipios/${this.municipioId()}`,
    }
  });

  private paisesResource = httpResource<Response<Pais[]>>(() => ({
    url: `${this.apiUrl}/paises`,
  }));

  readonly estados = this.estadosResource.asReadonly();
  readonly cpInfo = this.cpInfoResource.asReadonly();
  readonly municipios = this.municipiosResource.asReadonly();
  readonly paises = this.paisesResource.asReadonly();

  setMunicipioId(id: number | null) {
    this.municipioId.set(id);
  }

  setCp(cp: string | null) {
    this.cp.set(cp);
  }
}
