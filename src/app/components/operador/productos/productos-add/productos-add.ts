import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { Paginacion } from '../../../paginacion/paginacion';

import { ProductosService } from '../../../../services/productos/productos.service';
import { Articulo } from '../../../../interfaces/articulo.interface';

@Component({
  selector: 'app-productos-add',
  imports: [CommonModule, FormsModule, Paginacion, ReactiveFormsModule],
  templateUrl: './productos-add.html',
  styleUrl: './productos-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosAdd {

  protected productosService = inject(ProductosService);

  constructor() {
    afterNextRender(() => initFlowbite());
  }

  // Productos disponibles (pueden venir de backend luego)
  productos = signal<Articulo[]>([
    { id: 1, nombre: 'Café', precioEstandar: 20, descripcion: '', tipo: 'producto' },
    { id: 2, nombre: 'Agua', precioEstandar: 20, descripcion: '', tipo: 'producto' },
    { id: 3, nombre: 'Collar', precioEstandar: 150, descripcion: '', tipo: 'producto' },
  ]);

  Busqueda = signal<string>('');

  productosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    if (!termino) return this.productos();

    return this.productos().filter(p =>
      p.id?.toString().includes(termino) ||
      p.nombre.toLowerCase().includes(termino) ||
      p.precioEstandar.toString().includes(termino)
    );
  });

  actualizarBusqueda(event: Event) {
    this.Busqueda.set((event.target as HTMLInputElement).value);
  }

  agregarProducto(producto: Articulo) {
    this.productosService.agregarProducto(producto);
  }

  eliminarProducto(producto: Articulo) {
    this.productosService.eliminarProducto(producto.id!);
  }
}
