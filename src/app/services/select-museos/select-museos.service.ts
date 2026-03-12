import { computed, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Response } from '../../interfaces/response.interface';
import { Museo } from '../../interfaces/museo.interface';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SelectMuseos {
  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}/all`;

  private readonly museosResource = httpResource<Response<Museo[]>>(() => ({
      url: this.API_URL,
    })
  );

  museos = this.museosResource.asReadonly();
}