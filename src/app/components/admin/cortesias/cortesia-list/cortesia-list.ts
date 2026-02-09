import { ChangeDetectionStrategy ,Component, inject } from '@angular/core';
import { CortesiaCreate } from '../cortesia-create/cortesia-create';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { InvitadosService } from '../../../../services/invitados/invitados.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cortesia-list',
  imports: [CortesiaCreate, DatePipe],
  templateUrl: './cortesia-list.html',
  styleUrl: './cortesia-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaList {
  private invitadoService = inject(InvitadosService);

  protected invitados = this.invitadoService.invitados;

  nuevoInvitado(invitado: Invitado) {
    this.invitadoService.createInvitado(invitado);
  }
}
