import {
  Component,
  Input,
  inject,
  signal,
  afterNextRender,
  computed,
  input,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { initModals } from 'flowbite';

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

  // @Input({ required: true }) ventaId!: number;
  readonly ventaId = input<number>();

  venta = signal<ProductoVenta | null>(null);

  protected readonly modalId = computed(() => `ver-venta-modal-${this.ventaId()}`);

  constructor() {
    afterNextRender(() => {
      initModals();
    });
  }

  abrirModal(): void {
    const currentVenta = this.ventaId() ?? 0;

    this.productoVentaService
      .getVentaById(currentVenta)
      .subscribe(res => {
        this.venta.set(res.data ?? null);
      });
  }
}
