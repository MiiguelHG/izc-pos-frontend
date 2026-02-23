import { Injectable, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Rol } from '../../interfaces/rol.interface';

interface RolesResponse {
  data: Rol[];
  page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly API_URL = 'http://localhost:3000/api/roles';

  private readonly rolesResource = httpResource<RolesResponse>(
    () => ({ url: this.API_URL })
  );

  readonly roles = this.rolesResource.asReadonly();
}