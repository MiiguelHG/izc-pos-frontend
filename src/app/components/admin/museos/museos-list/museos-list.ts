import { Component, inject, signal, effect, ChangeDetectionStrategy} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { MuseosEdit } from "../museos-edit/museos-edit";
import { MuseosCreate } from "../museos-create/museos-create";
import { Paginacion } from "../../../paginacion/paginacion";
import { initModals } from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { Museo } from '../../../../interfaces/museo.interface';
import { AuthService } from '../../../../services/auth/auth.service';
import { formatDireccion } from '../../../../helpers/index';

@Component({
  selector: 'app-museos-list',
  imports: [MuseosEdit, MuseosCreate, Paginacion],
  templateUrl: './museos-list.html',
  styleUrl: './museos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MuseosList {
  protected museoService = inject(MuseosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected museos = this.museoService.museos;
  protected user = this.authService.user;
  protected formatDireccion = formatDireccion;

  constructor() {

    effect(() => {
      // Solo si ya no está cargando, hay datos y no hay error, inicializamos los modales
      if (!this.museos.isLoading() && this.museos.value()?.data && !this.museos.error()) {
        initModals();
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
  }
}
