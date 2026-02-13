import { Injectable, signal } from '@angular/core';
import { Articulo } from '../../interfaces/articulo.interface';
import { ProductoCarrito } from '../../interfaces/producto-carrito.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  productosAgregados = signal<ProductoCarrito[]>([]);


  agregarProducto(producto: Articulo) {
    const existe = this.productosAgregados()
      .some(p => p.id === producto.id);

    if (existe) return;

    this.productosAgregados.update(productos => [
      ...productos,
      { ...producto, cantidad: 1 }
    ]);
  }

 
  eliminarProducto(productoId: number) {
    this.productosAgregados.update(productos =>
      productos.filter(p => p.id !== productoId)
    );
  }

 
  incrementarCantidad(productoId: number) {
    this.productosAgregados.update(productos =>
      productos.map(p =>
        p.id === productoId
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      )
    );
  }


  decrementarCantidad(productoId: number) {
    this.productosAgregados.update(productos =>
      productos
        .map(p =>
          p.id === productoId
            ? { ...p, cantidad: p.cantidad - 1 }
            : p
        )
        .filter(p => p.cantidad > 0)
    );
  }


  estaAgregado(productoId: number): boolean {
    return this.productosAgregados().some(p => p.id === productoId);
  }

  totalProductos(): number {
    return this.productosAgregados()
      .reduce((acc, p) => acc + p.cantidad, 0);
  }

  totalMonto(): number {
    return this.productosAgregados()
      .reduce((acc, p) => acc + (p.precioEstandar * p.cantidad), 0);
  }

  limpiarCarrito() {
    this.productosAgregados.set([]);
  }
}
