import {
  Component,
  signal,
  computed,
  afterEveryRender,
  inject,
  effect,
  afterNextRender
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { ProductoVerVenta } from '../producto-info/producto-info';
import { ProductoVentaService } from '../../../../services/productoVenta/producto-venta.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ProductoVenta } from '../../../../interfaces/producto-venta.interface';


@Component({
  selector: 'app-productos-venta',
  standalone: true,
  imports: [
    ProductoVerVenta,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './productos-vendidos.html',
  styleUrl: './productos-vendidos.css',
})
export class ProductosVenta {

  private productoVentaService = inject(ProductoVentaService);
  private authService = inject(AuthService);

  protected ventas = this.productoVentaService.ventas;
  protected user = this.authService.user;

  Busqueda = signal<string>('');

  constructor() {
    afterNextRender(() => initFlowbite());

    //Filtrar por museo
    effect(() => {
      const user = this.user();
      if (user?.museoId) {
        this.productoVentaService.museoId.set(user.museoId);
        this.productoVentaService.recargarVentas();
      }
    });
  }

  ventasData = computed(() => {
    return this.ventas.value()?.data?.ventas ?? [];
  });

  productosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    const ventas = this.ventasData();

    if (!termino) return ventas;

    return ventas.filter((venta: ProductoVenta) =>
      venta.id.toString().includes(termino) ||
      venta.fechaVenta.toLowerCase().includes(termino) ||
      venta.total.toString().includes(termino)
    );
  });

  
  actualizarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }
}
