import { Component, inject, signal, effect} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { MuseosEdit } from "../museos-edit/museos-edit";
import { MuseosCreate } from "../museos-create/museos-create";
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { Museo } from '../../../../interfaces/museo.interface';
import { Ubicacion } from '../../../../interfaces/ubicacion.interface';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-museos-list',
  imports: [MuseosEdit, MuseosCreate, Paginacion],
  templateUrl: './museos-list.html',
  styleUrl: './museos-list.css',
})
export class MuseosList {
  protected museoService = inject(MuseosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected museos = this.museoService.museos;
  protected user = this.authService.user;

  constructor() {

    effect(() => {
      // Solo si ya no está cargando y nuevos datos están disponibles
      if (!this.museos.isLoading() && this.museos.value()?.data) {
        initFlowbite();
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? params['page'] : '1';
      this.museoService.currentPage.set(page);
    });

  }

  updateMuseo(updatedMuseo: Museo) {
    const id = updatedMuseo.id!;

    const updatedData = { ...updatedMuseo };
    delete updatedData.id;
    this.museoService.updateMuseo(id, updatedData);
  }

  createMuseo(newMuseoData:Museo) {
    this.museoService.createMuseo(newMuseoData);
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
    initFlowbite();
  }

  formatDireccion(ubicacion?: Ubicacion): string {
    if (!ubicacion) {
      return '';
    }

    const encabezadoDireccion = [
      ubicacion.calle?.trim(),
      ubicacion.numero != null ? `No. ${ubicacion.numero}` : null,
    ]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(' ');

    const lugar = [ubicacion.colonia, ubicacion.ciudad, ubicacion.estado]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(', ');

    const codigoPostal = ubicacion.codigoPostal != null ? `CP ${ubicacion.codigoPostal}` : '';

    return [encabezadoDireccion, lugar, codigoPostal]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(', ');
  }
}
