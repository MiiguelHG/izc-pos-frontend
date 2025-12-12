import { afterEveryRender, ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Paginacion } from "../../../paginacion/paginacion";

@Component({
  selector: 'app-boletos-vendidos',
  imports: [DatePipe, Paginacion],
  templateUrl: './boletos-vendidos.html',
  styleUrl: './boletos-vendidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosVendidos {
  private boletoEmitidoService = inject(BoletoEmitidoService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  protected boletosEmitidosByMuseo = this.boletoEmitidoService.boletosEmitidosByMuseo;

  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    })

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
}
