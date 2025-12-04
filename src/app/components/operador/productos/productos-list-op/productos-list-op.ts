//productos-list-op.ts
import { Component, ChangeDetectionStrategy, afterNextRender, signal, computed, viewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { initFlowbite } from 'flowbite';

import { ProductosAdd } from '../productos-add/productos-add';
import { ProductosService } from '../../../../services/productos/productos.service';

import { ProductosTicket } from '../../../../services/productos-print/productos-ticket';
//Exportar variables para la impresión de tickets
export let PrecioTotal = 0;
export let prodcutosselect: string = '';


interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
}

@Component({
  selector: 'app-productos-list-op',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductosAdd],
  templateUrl: './productos-list-op.html',
  styleUrl: './productos-list-op.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosListOp {


  constructor(private ticketService: ProductosTicket) {
    afterNextRender(() => {
      initFlowbite();
    });
  }


  //Inyectar el servicio
  private productosService = inject(ProductosService);
  //Inyectar form
  private formBuilder = inject(FormBuilder);
  // Signal para almacenar el monto ingresado
  montoIngresado = signal<number>(0);
  //Signal para controlar la visibilidad del selector de pago
  mostrarMetodoPago = signal<boolean>(false);
  // Formulario para el ingreso
  FormIngreso = this.formBuilder.group({
    ingreso: [null, [Validators.pattern(/^\d*\.?\d{0,2}$/)]],
    nivelError: ['M'],
    pago: ['', Validators.required],
  });


  // Obtener productos agregados desde el servicio
  productos = computed(() => this.productosService.productosAgregados());



  //------------------------SOLO FILTRADO POR BUSQUEDA---------------------
  // Signal para el manejar busquedas
  Busqueda = signal<string>('');

  // Computed para filtrar productos segun la busqueda
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

  // Metodo para actualizar el término de búsqueda
  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }
  //---------------------------------------------------------------------------------------------

  // Obtener cantidades desde el servicio
  cantidad = computed(() => this.productosService.cantidades());


  totalProductos = computed(() => {
    let total = 0;
    for (const producto of this.productos()) {
      total += this.cantidad()[producto.id] || 0;
    }
    return total;
  });

  totalmonto = computed(() => {
    let totalDinero = 0;
    for (const producto of this.productos()) {
      const cantidadselectproductos = this.cantidad()[producto.id] || 0;
      const precioFinal = producto.precio - (producto.precio * producto.descuento / 100);
      totalDinero += precioFinal * cantidadselectproductos;
    }
    PrecioTotal = totalDinero;
    return totalDinero;
  });

  // Métodos actualizados para usar el servicio
  incrementar(producto: Producto) {
    this.productosService.incrementarCantidad(producto.id);
  }

  decrementar(producto: Producto) {
    this.productosService.decrementarCantidad(producto.id);
  }

  totalcambio = computed(() => {
    const ingreso = this.montoIngresado();
    const total = this.totalmonto();
    return ingreso > 0 ? ingreso - total : 0;
  });

  ngOnInit() {
    this.FormIngreso.get('ingreso')?.valueChanges.subscribe(valor => {
      const monto = Number(valor) || 0;
      this.montoIngresado.set(monto);
    });
  }


  //Acción del botón imprimir 
  produstosSeleccionados(): string[] {
    const seleccionados: string[] = [];
    for (const producto of this.productosFiltrados()) {
      const cantidadselectproductos = this.cantidad()[producto.id] || 0;
      if (cantidadselectproductos > 0) {
        const precioFinal = producto.precio - (producto.precio * producto.descuento / 100);
        seleccionados.push(`${producto.nombre} x${cantidadselectproductos} - $${precioFinal.toFixed(2)}`);
      }
    }
    //tomar el ultimo arreglo de boletos seleccionados para imprimir en el ticket
    prodcutosselect = seleccionados.toString()
    console.log('Productos seleccionados:', prodcutosselect);


    //Si no hay prodcutos seleccionados
    const pagoSeleccionado = this.FormIngreso.controls.pago.value;
    const pago = (pagoSeleccionado);
    console.log('Se eligio pagar con:', pago);
    let bandera2, bandera3 = false;
    if (this.totalProductos() === 0) {
      console.log('No hay productos seleccionados');
      alert('No hay productos seleccionados');
      bandera2 = false;
    }
    else {
      bandera2 = true;

    }

    //si pago es diferente a efectivo o tarjeta
    if (pago !== 'efectivo' && pago !== 'tarjeta') {
      this.mostrarMetodoPago.set(true);
      console.log('No hay pago seleccionado');
      alert('No hay pago seleccionado');
      bandera3 = false;
    } else {
      this.mostrarMetodoPago.set(false);
      bandera3 = true;


    }
    if (bandera2 == true && bandera3 == true) {
      this.imprimir();

    }

    return seleccionados;

  }


  // Ver preview
  verPreview() {
    this.ticketService.vistaPrevia();
  }

  // Imprimir
  imprimir() {
    this.ticketService.imprimirTicket();
  }


}
