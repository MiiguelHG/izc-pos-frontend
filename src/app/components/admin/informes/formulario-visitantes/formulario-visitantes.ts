import { afterNextRender, Component, effect, inject, output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FiltrosVisitantes } from '../types/informe';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-formulario-visitantes',
  imports: [],
  templateUrl: './formulario-visitantes.html',
  styleUrl: './formulario-visitantes.css',
})
export class FormularioVisitantes {
  formBuilder = inject(FormBuilder);

  constructor() {
    afterNextRender(() => initFlowbite());
  }

  // filtrosChanged = output<FiltrosVisitantes>();

  // filtrosForm = this.formBuilder.group({
  //   edadMin: [0, Validators.min(0)],
  //   edadMax: [100, Validators.max(100)],
  //   genero: ['todos'],
  //   procedencia: [''],
  //   tipoVisita: ['individual'],
  // });

  // constructor() {
  //   // Emitir cambios cuando el formulario se actualiza alguno de sus valores
  //   effect(() => {
  //     this.filtrosForm.valueChanges.subscribe(() => {
  //       if (this.filtrosForm.valid) {
  //         this.emitirFiltros();
  //       }
  //     })
  //   })
  // }

  // emitirFiltros() {
  //   // TODO: Completar la lógica para emitir los filtros del formulario
  // }
}
