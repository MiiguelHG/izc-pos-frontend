import { afterNextRender, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { initModals } from 'flowbite';

@Component({
  selector: 'app-boletos-habilitar-deshabilitar',
  imports: [],
  templateUrl: './boletos-habilitar-deshabilitar.html',
  styleUrl: './boletos-habilitar-deshabilitar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosHabilitarDeshabilitar {
  readonly boleto = input.required<BoletoTipo>();

  readonly agreeToToggle = output<number>();

  protected readonly modalId = computed(() => `toggle-boleto-modal-${this.boleto()?.id}`);
  protected readonly estaHabilitado = computed(() => this.boleto()?.habilitado ?? true);

  constructor() {
    // afterNextRender(() => {
    //   initModals();
    // });
  }

  onConfirmar(): void {
    this.agreeToToggle.emit(this.boleto().id!);
  }
}
