import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { initFlowbite } from 'flowbite';

import { ProductosAdd } from '../productos-add/productos-add';
import { ProductosService } from '../../../../services/productos/productos.service';
import { ProductoCarrito } from '../../../../interfaces/producto-carrito.interface';
import { ProductosTicket } from '../../../../services/productos-print/productos-ticket';

// Exportar para ticket
export let PrecioTotal = 0;
export let prodcutosselect = '';

@Component({
  selector: 'app-productos-list-op',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductosAdd],
  templateUrl: './productos-list-op.html',
  styleUrl: './productos-list-op.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosListOp {

  private productosService = inject(ProductosService);
  private formBuilder = inject(FormBuilder);
  private ticketService = inject(ProductosTicket);

  constructor() {
    afterNextRender(() => initFlowbite());
  }

  // ===== FORM =====
  montoIngresado = signal<number>(0);

  FormIngreso = this.formBuilder.group({
    ingreso: [null, [Validators.pattern(/^\d*\.?\d{0,2}$/)]],
    pago: ['', Validators.required],
  });

  // ===== CARRITO =====
  productos = computed(() => this.productosService.productosAgregados());

  totalProductos = computed(() =>
    this.productos().reduce(
      (acc: number, p: ProductoCarrito) => acc + p.cantidad,
      0
    )
  );

  totalMonto = computed(() => {
    const total = this.productos().reduce(
      (acc: number, p: ProductoCarrito) =>
        acc + (p.precioEstandar * p.cantidad),
      0
    );
    PrecioTotal = total;
    return total;
  });

  totalCambio = computed(() => {
    const ingreso = this.montoIngresado();
    return ingreso > 0 ? ingreso - this.totalMonto() : 0;
  });

  // ===== BUSQUEDA =====
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

  // ===== CARRITO ACTIONS =====
  incrementar(p: ProductoCarrito) {
    this.productosService.incrementarCantidad(p.id!);
  }

  decrementar(p: ProductoCarrito) {
    this.productosService.decrementarCantidad(p.id!);
  }

  // ===== TICKET =====
  produstosSeleccionados(): string[] {
    const seleccionados = this.productos().map(p =>
      `${p.nombre} x${p.cantidad} - $${(p.precioEstandar * p.cantidad).toFixed(2)}`
    );

    prodcutosselect = seleccionados.toString();
    return seleccionados;
  }

  verPreview() {
    this.ticketService.vistaPrevia();
  }

  imprimir() {
    this.ticketService.imprimirTicket();
  }
}
