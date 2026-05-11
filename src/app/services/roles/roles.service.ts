import { Injectable, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Rol } from '../../interfaces/rol.interface';
import { API_CONFIG } from '../../config/api.config';

interface RolesResponse {
  data: Rol[];
  page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles}`;

  private readonly rolesResource = httpResource<RolesResponse>(
    () => ({ url: this.API_URL })
  );

  readonly roles = this.rolesResource.asReadonly();
}