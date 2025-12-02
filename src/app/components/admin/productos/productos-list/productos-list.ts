import { Component, signal, computed } from '@angular/core';
import { ProductosEdit } from "../productos-edit/productos-edit";
import { ProductosDelete } from "../productos-delete/productos-delete";
import { ProductosCreate } from "../productos-create/productos-create";
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
}

@Component({
  selector: 'app-productos-list',
  imports: [ProductosEdit, ProductosDelete, ProductosCreate, Paginacion],
  templateUrl: './productos-list.html',
  styleUrl: './productos-list.css',
})
export class ProductosList {
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

  ngAfterViewInit() {
    initFlowbite();
  }

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }

  deleteProducto(id: number) {
    this.productos.set(this.productos().filter(producto => producto.id !== id));
  }

  updateProducto(updatedProducto: Producto) {
    this.productos.update(productos => 
      productos.map(producto => 
        producto.id === updatedProducto.id ? updatedProducto : producto
      )
    );
  }

  createProducto(newProductoData: Omit<Producto, 'id'>) {
    const maxId = Math.max(...this.productos().map(p => p.id), 0);
    const newProducto: Producto = {
      id: maxId + 1,
      ...newProductoData
    };
    
    this.productos.update(productos => [...productos, newProducto]);
  }
}
