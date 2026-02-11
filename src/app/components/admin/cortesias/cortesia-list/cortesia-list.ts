import { ChangeDetectionStrategy ,Component, inject } from '@angular/core';
import { CortesiaCreate } from '../cortesia-create/cortesia-create';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { InvitadosService } from '../../../../services/invitados/invitados.service';
import { DatePipe } from '@angular/common';
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cortesia-list',
  imports: [CortesiaCreate, DatePipe, Paginacion],
  templateUrl: './cortesia-list.html',
  styleUrl: './cortesia-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaList {
  private invitadoService = inject(InvitadosService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected invitados = this.invitadoService.invitados;

  nuevoInvitado(invitado: Invitado) {
    this.invitadoService.createInvitado(invitado);
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
