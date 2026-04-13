import { Component, inject, effect } from '@angular/core';
import { initModals } from 'flowbite'; 
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { FormaPago } from '../../../../interfaces/forma-pago.interface';
import { FormaPagoCreate } from '../forma-pago-create/forma-pago-create';
import { FormaPagoEdit } from '../forma-pago-edit/forma-pago-edit';
import { FormaPagoDelete } from '../forma-pago-delete/forma-pago-delete';

@Component({
  selector: 'app-formas-pago-table',
  standalone: true,
  imports: [FormaPagoCreate, FormaPagoEdit, FormaPagoDelete],
  templateUrl: './formas-pago-table.html',
})
export class FormasPagoTable {

  private formaPagoService = inject(FormaPagoService);

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
      next: () => this.formaPagoService.recargar(),
      error: (err) => alert(err.error?.message ?? 'No se pudo crear la forma de pago'),
    });
  }

  onEdit(data: FormaPago) {
    this.formaPagoService.editar(data.id, { nombre: data.nombre, descripcion: data.descripcion }).subscribe({
      next: () => this.formaPagoService.recargar(),
      error: (err) => alert(err.error?.message ?? 'No se pudo actualizar la forma de pago'),
    });
  }

  onToggle(data: FormaPago) {
    this.formaPagoService.toggle(data.id).subscribe({
      next: () => this.formaPagoService.recargar(),
      error: (err) => alert(err.error?.message ?? 'No se pudo actualizar la forma de pago'),
    });
  }
}