import { Component, Input, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { ProductoVenta } from '../../../../interfaces/producto-venta.interface';
import { ProductoVentaService } from '../../../../services/productoVenta/producto-venta.service';

@Component({
  selector: 'app-producto-ver-venta',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './producto-info.html',
  styleUrl: './producto-info.css',
})
export class ProductoVerVenta {

  private productoVentaService = inject(ProductoVentaService);

  @Input({ required: true }) ventaId!: number;

  venta = signal<ProductoVenta | null>(null);

  abrirModal(): void {
    this.productoVentaService.getVentaById(this.ventaId).subscribe(res => {
      this.venta.set(res.data ?? null);
    });
  }
  cerrarModal(): void {
  const modal = document.getElementById(`ver-venta-modal-${this.ventaId}`);
  modal?.classList.add('hidden');
}

}
