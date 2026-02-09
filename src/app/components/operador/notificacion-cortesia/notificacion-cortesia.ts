import { afterNextRender, ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { initModals, Modal } from 'flowbite';
import { InvitadosPendientesService } from '../../../services/invitados/invitados-pendientes.service';

@Component({
  selector: 'app-notificacion-cortesia',
  imports: [],
  templateUrl: './notificacion-cortesia.html',
  styleUrl: './notificacion-cortesia.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionCortesia {
  private invitadoService = inject(InvitadosPendientesService);

  protected invitadosNotificacion = this.invitadoService.invitadosNotificacion;

  invitadoId = output<number>();

  constructor() {
    afterNextRender(() => initModals());
  }

  aplicarCortesia(invitadoId: number): void {
    this.invitadoId.emit(invitadoId);
    const modalElement = document.getElementById('cortesia-modal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.hide();
    }
  }
}
