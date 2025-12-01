// boletos-form-list.ts
import { Component, signal, computed, inject, effect } from '@angular/core';

import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';
import { bandera, ExportTotalVisitantes } from '../../form-visit/form-visit';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';


import { Dropdown } from 'flowbite';
import type { DropdownOptions, DropdownInterface } from 'flowbite';

//  Servicio de impresión
import { Printing } from '../../../../services/esc-pos/printing';

//Exportar variables para la impresión de tickets
export let PrecioTotal = 0;
export let boletosselect: string = '';
// Define el tipo
export type NivelCorreccionQR = 'L' | 'M' | 'Q' | 'H';

// Define la variable con ese tipo
export let nivelErrorQR: NivelCorreccionQR = 'M';

interface Boleto {
  id: number;
  nombre: string;
  price: number;
  discount: number;

}

@Component({
  selector: 'app-boletos-form-list',
  imports: [Paginacion, ReactiveFormsModule],
  templateUrl: './boletos-form-list.html',
  styleUrls: ['./boletos-form-list.css'],
})
export class BoletosFormList {

  private formBuilder = inject(FormBuilder);
  // inyectar servicio de impresión
  private printingService = inject(Printing);
  // Signal para almacenar el monto ingresado
  montoIngresado = signal<number>(0);

  //Signal para controlar la visibilidad del selector de pago
  mostrarMetodoPago = signal<boolean>(false);
  // Formulario para el ingreso y nivel de error
  FormIngreso = this.formBuilder.group({
    ingreso: [null, [Validators.pattern(/^\d*\.?\d{0,2}$/)]],
    nivelError: ['M'],
    pago: ['', Validators.required]
  });


  boletos = signal<Boleto[]>([
    { id: 1, nombre: 'Normal', price: 76, discount: 0 },
    { id: 2, nombre: 'Niños', price: 76, discount: 100 },
    { id: 3, nombre: 'Estudiantes', price: 76, discount: 50 },
    { id: 4, nombre: 'Tercera edad', price: 76, discount: 100 },
    { id: 5, nombre: 'Vip', price: 76, discount: 100 },
  ]);

  cantidad = signal<{ [id: number]: number }>({});
  maxBoletos = signal(ExportTotalVisitantes);

  // Computed signals para calcular totales automáticamente (se usa computed en vez de signal)
  // computed para calculos dinamoicos para actualizar autom ya que depend de otros reactivos
  //Sumar el precio 
  totalBoletos = computed(() => {
    let total = 0;
    for (const boleto of this.boletos()) {
      total += this.cantidad()[boleto.id] || 0;
    }
    return total;
  });

  totalmonto = computed(() => {
    let totalDinero = 0;
    for (const boleto of this.boletos()) {
      const cantidadselectboletos = this.cantidad()[boleto.id] || 0;
      const precioFinal = boleto.price - (boleto.price * boleto.discount / 100);
      totalDinero += precioFinal * cantidadselectboletos;
    }


    return totalDinero;
  });


  // Método para toggle del selector de pago
  toggleMetodoPago() {
    this.mostrarMetodoPago.update(valor => !valor);
  }

  //Obtener boletos seleccionados y cantidad y precio boleto
  boletosSeleccionados(): string[] {
    const seleccionados: string[] = [];
    for (const boleto of this.boletos()) {
      const cantidadselectboletos = this.cantidad()[boleto.id] || 0;
      if (cantidadselectboletos > 0) {
        const precioFinal = boleto.price - (boleto.price * boleto.discount / 100);
        seleccionados.push(`${boleto.nombre} x${cantidadselectboletos} - $${precioFinal.toFixed(2)}`);
      }
    }
    //tomar el ultimo arreglo de boletos seleccionados para imprimir en el ticket
    boletosselect = seleccionados.toString()
    console.log('Boletos seleccionados:', boletosselect);
    //Nivel de error seleccionado para el QR

    const nivelSeleccionado = this.FormIngreso.controls.nivelError.value;
    nivelErrorQR = (nivelSeleccionado as NivelCorreccionQR) || 'M';
    console.log('Nivel de error QR', nivelErrorQR);

    const pagoSeleccionado = this.FormIngreso.controls.pago.value;
    const pago = (pagoSeleccionado);
    console.log('Se eligio pagar con:', pago);

    let bandera1, bandera2, bandera3=false;
    //Si no hay visitantes
    if (this.totalBoletos() === 0) {
      console.log('No hay boletos seleccionados');
      alert('No hay boletos seleccionados');
      bandera1=false;

    }else{
      bandera1=true;

    }
    // si totalboletos y exportTotalVisitantes son diferentes
    if (this.totalBoletos() !== ExportTotalVisitantes) {
      console.log('No hay visitantes suficientes');
      alert('No hay visitantes suficientes, los boletos no coinciden');
    bandera2=false;
    }
    else{
      bandera2=true;

    }
    
    //si pago es diferente a efectivo o tarjeta
    if (pago !== 'efectivo' && pago !== 'tarjeta') {
      this.mostrarMetodoPago.set(true);
      console.log('No hay pago seleccionado');
      alert('No hay pago seleccionado');
      bandera3=false;
    } else {
      this.mostrarMetodoPago.set(false);
       bandera3=true;

      
    }
    if (bandera1==true && bandera2==true && bandera3==true) {
      this.verPreview();
    }

    return seleccionados;
  }

  // Ver preview en nueva ventana
  verPreview() {
    this.ticketService.vistaPrevia();
  }

  // Imprimir directamente
  imprimir() {
    this.ticketService.imprimirTicket();
  }


  // Computed para saber si se alcanzó el máximo
  maxAlcanzado = computed(() => this.totalBoletos() >= this.maxBoletos());

  constructor(private ticketService: Printing) {

    effect(() => {
      PrecioTotal = this.totalmonto();
      console.log('Precio $', PrecioTotal);
    });
    // Actualizar maxBoletos cuando cambie ExportTotalVisitantes
    setInterval(() => {
      if (this.maxBoletos() !== ExportTotalVisitantes) {
        this.maxBoletos.set(ExportTotalVisitantes);
      }
    }, 100);
  }

  incrementar(boleto: Boleto) {
    // Solo incrementar si no se ha alcanzado el máximo total
    if (this.totalBoletos() < this.maxBoletos()) {
      const actual = this.cantidad()[boleto.id] || 0;
      this.cantidad.update(val => ({
        ...val,
        [boleto.id]: actual + 1
      }));
    }
  }

  decrementar(boleto: Boleto) {
    const actual = this.cantidad()[boleto.id] || 0;
    if (actual > 0) {
      this.cantidad.update(val => ({
        ...val,
        [boleto.id]: actual - 1
      }));
    }
  }

  // Método para deshabilitar botones especificos 
  botonIncrementarDeshabilitado(boleto: Boleto): boolean {
    return this.maxAlcanzado();
  }

  botonDecrementarDeshabilitado(boleto: Boleto): boolean {
    const actual = this.cantidad()[boleto.id] || 0;
    return actual === 0;
  }


  //Herramienta para calcular cambio 
  // Computed para calcular el cambio
  totalcambio = computed(() => {
    const ingreso = this.montoIngresado();
    const total = this.totalmonto();
    return ingreso > 0 ? ingreso - total : 0;
  });

  ngOnInit() {
    // Suscribirse a cambios en el formulario para actualizar el signal
    this.FormIngreso.get('ingreso')?.valueChanges.subscribe(valor => {
      const monto = Number(valor) || 0;
      this.montoIngresado.set(monto);
    });

  }




}