import { Component, ChangeDetectionStrategy, afterNextRender, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { Paginacion } from '../../../paginacion/paginacion';
// Importar el servicio compartido
import { BoletosService, Boleto } from '../../../../services/boletos/boletos.service';
import { ExportTotalVisitantes } from '../../form-visit/form-visit';

@Component({
  selector: 'app-boletos-add',
  imports: [CommonModule, FormsModule, Paginacion, ReactiveFormsModule],
  templateUrl: './boletos-add.html',
  styleUrl: './boletos-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosAdd {
  // Inyectar el servicio compartido
  private boletosService = inject(BoletosService);
  private formBuilder = inject(FormBuilder);

  
 // Calcular el total de boletos
  maxBoletos2 = computed(() => {
    let total = 0;
    const boletos = this.boletosService.boletosAgregados();
    const cantidades = this.boletosService.cantidades();

    for (const boleto of boletos) {
      total += cantidades[boleto.id] || 0;
    }
    return total;
  });

  // Ya no necesitas el effect en el constructor
  constructor() {
    afterNextRender(() => {
      initFlowbite();
    });

    // Escuchar cuando se elimina un boleto desde boletos-list-op usando effect
    effect(() => {
      const boletoId = this.boletosService.boletoEliminado();
      if (boletoId !== null) {
        this.boletos.update(boletos =>
          boletos.map(p =>
            p.id === boletoId ? { ...p, agregado: false } : p
          )
        );
      }
    });
  }

  montoIngresado = signal<number>(0);

  FormIngreso = this.formBuilder.group({
    ingreso: [null, [Validators.pattern(/^\d*\.?\d{0,2}$/)]],
  });



  boletos = signal<Boleto[]>([
    { id: 1, nombre: 'Normal', price: 76, discount: 0 },
    { id: 2, nombre: 'Niños', price: 76, discount: 100 },
    { id: 3, nombre: 'Estudiantes', price: 76, discount: 50 },
    { id: 4, nombre: 'Tercera edad', price: 76, discount: 100 },
    { id: 5, nombre: 'Vip', price: 76, discount: 100 },
  ]);

  Busqueda = signal<string>('');

  boletosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    if (!termino) return this.boletos();
    return this.boletos().filter(boleto =>
      boleto.id.toString().includes(termino) ||
      boleto.nombre.toLowerCase().includes(termino) ||
      boleto.price.toString().includes(termino) ||
      boleto.discount.toString().includes(termino)
    );
  });

  boletoEditado = signal<Boleto>({ id: 0, nombre: '', price: 0, discount: 0 });
  boletoAEliminar = signal<Boleto | null>(null);

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }

  // Método actualizado para agregar boleto usando el servicio
  agregarBoleto(boleto: Boleto) {
    this.boletos.update(boletos =>
      boletos.map(p =>
        p.id === boleto.id ? { ...p, agregado: true } : p
      )
    );
    this.boletosService.agregarBoleto(boleto);
  }

  // Método actualizado para resetear boleto usando el servicio
  resetearBoleto(boleto: Boleto) {
    this.boletos.update(boletos =>
      boletos.map(p =>
        p.id === boleto.id ? { ...p, agregado: false } : p
      )
    );
    this.boletosService.eliminarBoleto(boleto.id);
  }


  //Bloquer boton agerear si no hay visitantes (ExportTotalVisitantes) y si maxBoletos2 es mayor a ExportTotalVisitantes
  // Método corregido para bloquear el botón ANTES de agregar
  botonbloqueado(boleto: Boleto): boolean {
    const maxVisitantes = ExportTotalVisitantes;
    const boletosActuales = this.maxBoletos2();

    // Bloquear si no hay visitantes registrados
    if (maxVisitantes === 0) {
      return true;
    }

    // Bloquear si ya se alcanzó el máximo de boletos permitidos
    if (boletosActuales >= maxVisitantes) {
      return true;
    }

    // Bloquear si el boleto ya fue agregado
    if (boleto.agregado) {
      return true;
    }

    // Permitir agregar boletos
    return false;
  }


}