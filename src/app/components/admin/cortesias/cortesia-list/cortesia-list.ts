import { ChangeDetectionStrategy ,Component, computed, effect, inject } from '@angular/core';
import { CortesiaCreate } from '../cortesia-create/cortesia-create';
import { CortesiaEdit } from '../cortesia-edit/cortesia-edit';
import { CortesiaCancelar } from '../cortesia-cancelar/cortesia-cancelar';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { InvitadosService } from '../../../../services/invitados/invitados.service';
import { Paginacion } from "../../../paginacion/paginacion";
import { initModals } from 'flowbite';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cortesia-list',
  imports: [CortesiaCreate, CortesiaEdit, CortesiaCancelar, Paginacion],
  providers: [InvitadosService],
  templateUrl: './cortesia-list.html',
  styleUrl: './cortesia-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaList {
  private invitadoService = inject(InvitadosService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected invitados = this.invitadoService.invitados;

  protected invitadosError = computed(() => {
    const error = this.invitados.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los invitados';
    return null;
  })

  constructor() {
    effect(() => {
      if (!this.invitados.isLoading() && !this.invitados.error() && this.invitados.value()?.data) {
        initModals();
      }
    });

    this.activatedRoute.queryParams
    .pipe(takeUntilDestroyed())
    .subscribe(params => {
      const page = params['page'] ? +params['page'] : 1;
      this.invitadoService.setPage(page);
    });
  }

  nuevoInvitado(invitado: Invitado) {
    this.invitadoService.createInvitado(invitado);
  }

  editarInvitado(invitado: Invitado) {
    this.invitadoService.updateInvitado(invitado);
  }

  cancelarInvitado(invitadoId: number) {
    this.invitadoService.cancelarInvitado(invitadoId);
  }
  onPageChange(page: number) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { page },
        queryParamsHandling: 'merge'
      });
    }
}
