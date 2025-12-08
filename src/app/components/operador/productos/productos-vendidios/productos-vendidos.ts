import { Component, signal, computed, afterEveryRender } from '@angular/core';

import { ProductoVerVenta } from '../producto-info/producto-info';
import { initFlowbite } from 'flowbite';

interface Producto {
  id: number;
  fecha: string;
  totalPrecio: number;
  formadePago: string;
  detalles: string;
}

@Component({
  selector: 'app-productos-venta',
  imports: [ProductoVerVenta],
  templateUrl: './productos-vendidos.html',
  styleUrl: './productos-vendidos.css',
})
export class ProductosVenta {
  productos = signal<Producto[]>([
    { id: 1, fecha: '04//12/2025' , detalles: 'Collares x3, Agua x2',  totalPrecio: 400, formadePago: 'Efectivo' },
    { id: 2, fecha: '06//12/2025' , detalles: 'Café x1 Agua x1', totalPrecio: 100, formadePago: 'Tarjeta'},
    { id: 3, fecha: '07//12/2025' , detalles: 'Agua x2', totalPrecio: 75, formadePago: 'Tarjeta' },
  ]);

  Busqueda = signal<string>('');

  productosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    if (!termino) return this.productos();
    return this.productos().filter(producto =>
      producto.id.toString().includes(termino) ||
      producto.fecha.toLowerCase().includes(termino) ||
      producto.detalles.toString().includes(termino) ||
      producto.totalPrecio.toString().includes(termino) ||
      producto.formadePago.toString().includes(termino)
    );
  });

  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    });
  }

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }


/*
  verProductoVenta(updatedProducto: Producto) {
    this.productos.update(productos =>
      productos.map(producto =>
        producto.id === updatedProducto.id ? updatedProducto : producto
      )
    );
  }
*/

}

