import { afterNextRender, Component, computed, input, output } from '@angular/core';
import { initModals } from 'flowbite';
import { FormaPago } from '../../../../interfaces/forma-pago.interface';

@Component({
  selector: 'app-forma-pago-delete',
  standalone: true,
  templateUrl: './forma-pago-delete.html',
})
export class FormaPagoDelete {

  formaPago = input<FormaPago>();
  agreeToToggle = output<FormaPago>();

  protected readonly modalId = computed(() =>
    `toggle-forma-pago-modal-${this.formaPago()?.id}`
  );

  constructor() {
    afterNextRender(() => initModals());
  }

  onConfirm() {
    const data = this.formaPago();
    if (!data) return;
    this.agreeToToggle.emit(data);
  }
}