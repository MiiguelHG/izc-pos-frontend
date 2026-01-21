import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { ActivatedRoute, Router } from '@angular/router';
import { Paginacion } from '../../../paginacion/paginacion';
import { MuseoArticuloService } from '../../../../services/museoArticulos/museo-articulo.service';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { ProductoCarrito } from '../../../../interfaces/producto-carrito.interface';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { ProductoVentaService } from '../../../../services/productoVenta/producto-venta.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { EmitirProductoVenta } from '../../../../interfaces/emitir-producto-venta.interface';
import { effect } from '@angular/core';



@Component({
  selector: 'app-productos-ventas',
  imports: [DecimalPipe, ReactiveFormsModule, Paginacion],
  templateUrl: './productos-ventas.html',
  styleUrl: './productos-ventas.css',
})

export class ProductosVentas {
  private productoVentaService = inject(ProductoVentaService);
  private authService = inject(AuthService);

  

  protected user = this.authService.user;
  protected currentProductoVenta = this.productoVentaService.currentProductoVenta;

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private formaPagoService = inject(FormaPagoService);

  protected formasPago = this.formaPagoService.formasPago;

  protected formaPago = new FormControl<number | null>(null, [
    Validators.required,
  ]);

  private museoArticuloService = inject(MuseoArticuloService);

  protected productos = this.museoArticuloService.productos;

  //CARRITO
  readonly carritoProductos = signal<ProductoCarrito[]>([]);

  protected totalProductos = computed(() =>
    this.carritoProductos().reduce((acc, p) => acc + p.cantidad, 0)
  );

  protected totalMonto = computed(() =>
    this.carritoProductos().reduce(
      (acc, p) => acc + (p.precioEstandar * p.cantidad),
      0
    )
  );

  protected estaEnCarrito = computed(() => {
    const carrito = this.carritoProductos();
    return (productoId: number) =>
      carrito.some(p => p.id === productoId);
  });

  constructor() {
      //EFFECT 1: cuando se completa una venta
  effect(() => {
    if (this.currentProductoVenta()) {
      this.carritoProductos.set([]);
      this.formaPago.reset();
      this.router.navigate(['/operador/productosventa']);
      this.productoVentaService.clearCurrentProductoVenta();
    }
  });

  //EFFECT 2: filtrar productos por museo
  effect(() => {
    const user = this.user();
    if (user?.museoId) {
      this.museoArticuloService.museoId.set(user.museoId);
      this.museoArticuloService.recargarProductos();
      this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? Number(params['page']) : 1;
      this.museoArticuloService.currentPage.set(page);
});

    }
  });
    
    afterNextRender(() => {
      initFlowbite();
    });
  }

  protected onPageChange(page: number): void {
  this.router.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: { page },
    queryParamsHandling: 'merge',
  });
}


  //MÉTODOS CARRITO
     

  agregarAlCarrito(producto: Articulo) {
    if (!producto.id || this.estaEnCarrito()(producto.id)) return;

    this.carritoProductos.update(carrito => [
      ...carrito,
      { ...producto, cantidad: 1 }
    ]);
  }

  eliminarDelCarrito(productoId: number) {
    this.carritoProductos.update(carrito =>
      carrito.filter(p => p.id !== productoId)
    );
  }

  incrementarCantidad(productoId: number) {
    this.carritoProductos.update(carrito =>
      carrito.map(p =>
        p.id === productoId
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      )
    );
  }

  decrementarCantidad(productoId: number) {
    this.carritoProductos.update(carrito =>
      carrito.map(p =>
        p.id === productoId && p.cantidad > 1
          ? { ...p, cantidad: p.cantidad - 1 }
          : p
      )
    );
  }
  
  emitirVentaProductos(): void {
  if (
    this.carritoProductos().length === 0 ||
    !this.formaPago.valid
  ) {
    return;
  }

  const payload: EmitirProductoVenta = {
    total: this.totalMonto(),
    carritoProductos: this.carritoProductos().map((p) => ({
      articuloId: p.id!,
      cantidad: p.cantidad,
    })),
    usuarioId: this.user()?.id ?? 0,
    museoId: this.user()?.museoId ?? 0,
    formaPagoId: this.formaPago.value ?? 0,
  };

  this.productoVentaService.emitirProductoVenta(payload);
}

}
