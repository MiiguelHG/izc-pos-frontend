import { afterNextRender, Component, computed, inject, effect } from '@angular/core';
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
import { ProductosService } from '../../../../services/productos/productos.service';

@Component({
  selector: 'app-productos-ventas',
  imports: [DecimalPipe, ReactiveFormsModule, Paginacion],
  templateUrl: './productos-ventas.html',
  styleUrl: './productos-ventas.css',
})
export class ProductosVentas {

  private productoVentaService = inject(ProductoVentaService);
  private productosService = inject(ProductosService);
  private museoArticuloService = inject(MuseoArticuloService);
  private authService = inject(AuthService);
  private formaPagoService = inject(FormaPagoService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected user = this.authService.user;
  protected productos = this.museoArticuloService.productos;
  protected formasPago = this.formaPagoService.formasPago;
  protected carritoProductos = this.productosService.productosAgregados;

  protected formaPago = new FormControl<number | null>(null, Validators.required);

  // ===== COMPUTED =====

  protected totalProductos = computed(() =>
    this.carritoProductos().reduce(
      (acc: number, p: ProductoCarrito) => acc + p.cantidad,
      0
    )
  );

  protected totalMonto = computed(() =>
    this.carritoProductos().reduce(
      (acc: number, p: ProductoCarrito) =>
        acc + (p.precioEstandar * p.cantidad),
      0
    )
  );

  protected estaEnCarrito = computed(() => {
    const carrito = this.carritoProductos();
    return (id: number) => carrito.some(p => p.id === id);
  });

  constructor() {

    // Venta completada → limpiar carrito
    effect(() => {
      if (this.productoVentaService.currentProductoVenta()) {
        this.productosService.limpiarCarrito();
        this.formaPago.reset();
        this.router.navigate(['/operador/productosventa']);
        this.productoVentaService.clearCurrentProductoVenta();
      }
    });

    // Cargar productos/servicios por museo
    effect(() => {
      const user = this.user();
      if (user?.museoId) {
        this.museoArticuloService.museoId.set(user.museoId);
        this.museoArticuloService.recargarProductos();
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? Number(params['page']) : 1;
      this.museoArticuloService.currentPage.set(page);
    });

    afterNextRender(() => initFlowbite());
  }

  protected onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  // ===== CARRITO =====

  agregarAlCarrito(producto: Articulo) {
    this.productosService.agregarProducto(producto);
  }

  eliminarDelCarrito(id: number) {
    this.productosService.eliminarProducto(id);
  }

  incrementarCantidad(id: number) {
    this.productosService.incrementarCantidad(id);
  }

  decrementarCantidad(id: number) {
    this.productosService.decrementarCantidad(id);
  }

  // ===== EMITIR VENTA =====

  emitirVentaProductos(): void {
    if (this.carritoProductos().length === 0 || !this.formaPago.valid) {
      return;
    }

    const payload: EmitirProductoVenta = {
      total: this.totalMonto(),
      carritoProductos: this.carritoProductos().map(p => ({
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
