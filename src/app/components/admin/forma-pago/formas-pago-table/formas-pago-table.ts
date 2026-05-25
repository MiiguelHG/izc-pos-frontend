import { Component, inject, effect } from '@angular/core';
import { initModals } from 'flowbite'; 
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { FormaPago } from '../../../../interfaces/forma-pago.interface';
import { FormaPagoCreate } from '../forma-pago-create/forma-pago-create';
import { FormaPagoEdit } from '../forma-pago-edit/forma-pago-edit';
import { FormaPagoDelete } from '../forma-pago-delete/forma-pago-delete';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-formas-pago-table',
  standalone: true,
  imports: [FormaPagoCreate, FormaPagoEdit, FormaPagoDelete],
  templateUrl: './formas-pago-table.html',
})
export class FormasPagoTable {
  private formaPagoService = inject(FormaPagoService);
  private toast = inject(ToastService);

  protected formasPago = this.formaPagoService.formasPago;

  constructor() {
    this.formaPagoService.recargar();
    effect(() => {
      if (this.formasPago.value()?.data && !this.formasPago.isLoading() && !this.formasPago.error()) {
        initModals();
      }
    });
  }

  onCreate(data: Omit<FormaPago, 'id'>) {
    this.formaPagoService.crear(data).subscribe({
      next: (res) => {
        this.formaPagoService.recargar()
        this.toast.showSuccess(res.message || 'Forma de pago creada correctamente');
      },
      error: (err) => this.toast.showError(err.error?.message ?? 'No se pudo crear la forma de pago'),
    });
  }

  onEdit(data: FormaPago) {
    this.formaPagoService.editar(data.id, { nombre: data.nombre, descripcion: data.descripcion }).subscribe({
      next: (res) => {
        this.formaPagoService.recargar();
        this.toast.showSuccess(res.message || 'Forma de pago actualizada correctamente');
      },
      error: (err) => this.toast.showError(err.error?.message ?? 'No se pudo actualizar la forma de pago'),
    });
  }

  onToggle(data: FormaPago) {
    this.formaPagoService.toggle(data.id).subscribe({
      next: (res) => {
        this.formaPagoService.recargar();
        this.toast.showSuccess(res.message || 'Forma de pago actualizada correctamente');
      },
      error: (err) => this.toast.showError(err.error?.message ?? 'No se pudo actualizar la forma de pago'),
    });
  }
}