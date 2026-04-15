import { Component, inject, output } from '@angular/core';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-boletos-precio-base',
  imports: [DecimalPipe, ReactiveFormsModule],
  templateUrl: './boletos-precio-base.html',
  styleUrl: './boletos-precio-base.css',
})
export class BoletosPrecioBase {
  private articuloService = inject(ArticulosService);

  protected boletoBase = this.articuloService.boletoBase;

  protected precio = new FormControl<number | null>(null);

  paylodadToUpdate = output<{ articuloId: number, precioEstandar: number }>();

  onSave() {
    if (!this.precio.valid || this.precio.value === null) {
      return;
    }
    
    const precioValue = this.precio.value;

    this.paylodadToUpdate.emit({ articuloId:this.boletoBase()?.id!, precioEstandar: precioValue! });

    this.precio.reset();

  }

  onCancel(): void {
    this.precio.reset();
    this.closeModal();
  }
    private closeModal(): void {
    const modal = document.getElementById('precio-base-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Flowbite inyecta el backdrop con este atributo
    document.querySelectorAll('[modal-backdrop]').forEach(el => el.remove());

    // A veces lo inyecta como clase en lugar de atributo
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    // Quitar bloqueo del scroll
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = '';
  }


}
