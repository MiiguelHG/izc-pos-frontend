import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Paginacion } from "../../../paginacion/paginacion";
import { HttpErrorResponse } from '@angular/common/http';
import { BoletoInfo } from '../boleto-info/boleto-info';
import { formatProcedencia } from '../../../../helpers/index';

@Component({
  selector: 'app-boletos-vendidos',
  imports: [DatePipe, Paginacion, RouterModule, BoletoInfo],
  templateUrl: './boletos-vendidos.html',
  styleUrl: './boletos-vendidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosVendidos {
  protected readonly formatProcedencia = formatProcedencia;
  private boletoEmitidoService = inject(BoletoEmitidoService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  protected readonly isChildRouteActive = signal(false);

  protected boletosEmitidosByMuseo = this.boletoEmitidoService.boletosEmitidosByMuseo;

  protected errorMessage = computed(() => {
    const error = this.boletosEmitidosByMuseo.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los boletos emitidos';
    return null;
  })

  constructor() {

    this.updateChildRouteState();
    this.router.events.subscribe(() => {
      this.updateChildRouteState();
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? params['page'] : '1';
      this.boletoEmitidoService.currentPage.set(page);
    })
  }

  protected onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
    });
  }

  protected goToRegistro(): void {
    this.router.navigate(['registro'], {
      relativeTo: this.activatedRoute,
    });
  }

  private updateChildRouteState(): void {
    this.isChildRouteActive.set(this.activatedRoute.firstChild !== null);
  }
}
