import { Component, inject, signal, effect} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MuseosEdit } from "../museos-edit/museos-edit";
import { MuseosDelete } from "../museos-delete/museos-delete";
import { MuseosCreate } from "../museos-create/museos-create";
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { Museo } from '../../../../interfaces/museo.interface';

@Component({
  selector: 'app-museos-list',
  imports: [MuseosEdit, MuseosDelete, MuseosCreate, Paginacion],
  templateUrl: './museos-list.html',
  styleUrl: './museos-list.css',
})
export class MuseosList {
  protected museoService = inject(MuseosService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected museos = this.museoService.museos;

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

  deleteMuseo(id: number) {
    this.museoService.deleteMuseo(id);
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
}
