import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TipoInforme } from '../types/informe';
import { FormularioVisitantes } from "../formulario-visitantes/formulario-visitantes";
import { FormularioIngresos } from "../formulario-ingresos/formulario-ingresos";

import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-formulario-base',
  imports: [ReactiveFormsModule, FormularioVisitantes, FormularioIngresos],
  templateUrl: './formulario-base.html',
  styleUrl: './formulario-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioBase {
  formBuilder = inject(FormBuilder);
  
  informeForm = this.formBuilder.group({
    startDate: [''],
    endDate: [''],
    reportType: ['visitantes'], // 'visitantes' o 'ingresos'
  });
  
  tipoInformeAcual = signal<TipoInforme>('visitantes');

  constructor() {
    // Suscribirse a los cambios del campo reportType
    this.informeForm.get('reportType')?.valueChanges.subscribe(value => {
      this.tipoInformeAcual.set(value as TipoInforme);
    });
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onSubmit() {
    const formValues = this.informeForm.value;
    console.log('Formulario enviado con los siguientes valores:', formValues);
    // Aquí puedes agregar la lógica para manejar el envío del formulario,
    // como llamar a un servicio para generar el informe basado en los valores del formulario.
  }

  
}
