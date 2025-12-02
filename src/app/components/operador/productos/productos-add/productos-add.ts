import { Component, ChangeDetectionStrategy, afterNextRender, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { Paginacion } from '../../../paginacion/paginacion';
// Importar el servicio compartido
import { ProductosService, Producto } from '../../../../services/productos/productos.service';

@Component({
  selector: 'app-productos-add',
  imports: [CommonModule, FormsModule, Paginacion, ReactiveFormsModule],
  templateUrl: './productos-add.html',
  styleUrl: './productos-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosAdd {
  // Inyectar el servicio compartido
  private productosService = inject(ProductosService);
  private formBuilder = inject(FormBuilder);

  constructor() {
    afterNextRender(() => {
      initFlowbite();
    });

    // Escuchar cuando se elimina un producto desde productos-list-op usando effect
    effect(() => {
      const productoId = this.productosService.productoEliminado();
      if (productoId !== null) {
        this.productos.update(productos => 
          productos.map(p => 
            p.id === productoId ? { ...p, agregado: false } : p
          )
        );
      }
    });
  }

  montoIngresado = signal<number>(0);
  
  FormIngreso = this.formBuilder.group({
    ingreso: [null, [Validators.pattern(/^\d*\.?\d{0,2}$/)]],
  });

  productos = signal<Producto[]>([
    { id: 1, nombre: 'Café', precio: 20, descuento: 0 },
    { id: 2, nombre: 'Agua', precio: 20, descuento: 10 },
    { id: 3, nombre: 'Collar', precio: 150, descuento: 0 },
  ]);

  Busqueda = signal<string>('');

  productosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    if (!termino) return this.productos();
    return this.productos().filter(producto =>
      producto.id.toString().includes(termino) ||
      producto.nombre.toLowerCase().includes(termino) ||
      producto.precio.toString().includes(termino) ||
      producto.descuento.toString().includes(termino)
    );
  });

  productoEditado = signal<Producto>({ id: 0, nombre: '', precio: 0, descuento: 0 });
  productoAEliminar = signal<Producto | null>(null);

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }

  // Método actualizado para agregar producto usando el servicio
  agregarProducto(producto: Producto) {
    this.productos.update(productos => 
      productos.map(p => 
        p.id === producto.id ? { ...p, agregado: true } : p
      )
    );
    this.productosService.agregarProducto(producto);
  }

  // Método actualizado para resetear producto usando el servicio
  resetearProducto(producto: Producto) {
    this.productos.update(productos => 
      productos.map(p => 
        p.id === producto.id ? { ...p, agregado: false } : p
      )
    );
    this.productosService.eliminarProducto(producto.id);
  }
}