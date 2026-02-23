import { afterNextRender, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { initModals } from 'flowbite';
import { Invitado } from '../../../../interfaces/invitado.interface';

@Component({
  selector: 'app-cortesia-cancelar',
  imports: [],
  templateUrl: './cortesia-cancelar.html',
  styleUrl: './cortesia-cancelar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaCancelar {
  readonly invitado = input<Invitado>();

  protected readonly modalId = computed(() => `cancelar-cortesia-modal-${this.invitado()?.id}`);

  confirmarCancelacion = output<number>();

  constructor() {
    afterNextRender(() => initModals());
  }

  onClickConfirmar() {
    const id = this.invitado()?.id;
    if (id !== undefined) {
      this.confirmarCancelacion.emit(id);
    }
  }
}
