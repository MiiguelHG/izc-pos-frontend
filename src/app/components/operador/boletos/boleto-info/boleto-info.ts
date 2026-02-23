import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { initModals } from 'flowbite';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';

@Component({
  selector: 'app-boleto-info',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './boleto-info.html',
  styleUrl: './boleto-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletoInfo {
  private boletoEmitidoService = inject(BoletoEmitidoService);

  readonly boletoId = input<number>();

  protected readonly modalId = computed(() => `boleto-info-modal-${this.boletoId()}`);
  protected readonly boleto = this.boletoEmitidoService.boletoEmitidoInfoById;

  constructor() {
    afterNextRender(() => initModals());
  }

  abrirModal(): void {
    const id = this.boletoId();
    if (id !== undefined) {
      this.boletoEmitidoService.setBoletoEmitidoId(id);
    }
  }
}
