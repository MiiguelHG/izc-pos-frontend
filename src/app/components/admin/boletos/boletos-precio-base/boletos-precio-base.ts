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

}
