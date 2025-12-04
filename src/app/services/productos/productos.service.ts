import { Injectable, signal } from '@angular/core';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
  agregado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
 
  productosAgregados = signal<Producto[]>([]);
  cantidades = signal<{ [id: number]: number }>({});

  // Agregar producto a la lista de operaciones
  agregarProducto(producto: Producto) {
    const existe = this.productosAgregados().find(p => p.id === producto.id);
    
    if (!existe) {
      this.productosAgregados.update(productos => [...productos, producto]);
      this.cantidades.update(cant => ({ ...cant, [producto.id]: 1 }));
    }
  }

  // Signal para notificar cuando se elimina un producto
  productoEliminado = signal<number | null>(null);

  // Eliminar producto de la lista de operaciones
  eliminarProducto(productoId: number) {
    this.productosAgregados.update(productos => 
      productos.filter(p => p.id !== productoId)
    );
    
    this.cantidades.update(cant => {
      const nuevasCant = { ...cant };
      delete nuevasCant[productoId];
      return nuevasCant;
    });

    //el producto fue eliminado
    this.productoEliminado.set(productoId);
    setTimeout(() => this.productoEliminado.set(null), 100);
  }

  // Metodo Incrementar cantidad
  incrementarCantidad(productoId: number) {
    const actual = this.cantidades()[productoId] || 0;
    this.cantidades.update(cant => ({ ...cant, [productoId]: actual + 1 }));
  }

  //Metodo Decrementar cantidad
  decrementarCantidad(productoId: number) {
    const actual = this.cantidades()[productoId] || 0;
    
    if (actual > 1) {
      this.cantidades.update(cant => ({ ...cant, [productoId]: actual - 1 }));
    } else if (actual === 1) {
      this.eliminarProducto(productoId);
    }
  }

  // Verificar si un producto está agregado
  estaAgregado(productoId: number): boolean {
    return this.productosAgregados().some(p => p.id === productoId);
  }
}