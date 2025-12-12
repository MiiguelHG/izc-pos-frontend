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
      const estadoRequest = this.museos.value();
      const estaCargando = this.museos.isLoading();

      // Solo si ya no está cargando y hay datos
      if (!estaCargando && estadoRequest?.data) {
        
        // Usamos setTimeout con 0ms o 1ms.
        // Esto mueve la ejecución al final de la cola de tareas del navegador,
        // garantizando que Angular ya terminó de pintar los <tr> del @for en el HTML.
        setTimeout(() => {
          initFlowbite();
        }, 0);
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
