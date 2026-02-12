import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TipoInforme } from '../types/informe';
import { FormularioVisitantes } from "../formulario-visitantes/formulario-visitantes";
import { FormularioIngresos } from "../formulario-ingresos/formulario-ingresos";

@Component({
  selector: 'app-formulario-base',
  imports: [ReactiveFormsModule, FormularioVisitantes, FormularioIngresos],
  templateUrl: './formulario-base.html',
  styleUrl: './formulario-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioBase {
  formBuilder = inject(FormBuilder);

  private readonly startDateInput = viewChild<ElementRef<HTMLInputElement>>('startDateInput');
  private readonly endDateInput = viewChild<ElementRef<HTMLInputElement>>('endDateInput');
  
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

    afterNextRender(() => {
      const startElement = this.startDateInput()?.nativeElement;
      const endElement = this.endDateInput()?.nativeElement;

      if (!startElement || !endElement) {
        return;
      }

      const sync = () => this.syncDateInputs();

      startElement.addEventListener('input', sync);
      startElement.addEventListener('change', sync);
      endElement.addEventListener('input', sync);
      endElement.addEventListener('change', sync);

      this.syncDateInputs();
    });
  }

  onSubmit() {
    this.syncDateInputs();
    const formValues = this.informeForm.value;
    console.log('Formulario enviado con los siguientes valores:', formValues);
    // Aquí puedes agregar la lógica para manejar el envío del formulario,
    // como llamar a un servicio para generar el informe basado en los valores del formulario.
  }

  private syncDateInputs() {
    const startValue = this.startDateInput()?.nativeElement.value ?? '';
    const endValue = this.endDateInput()?.nativeElement.value ?? '';

    this.informeForm.patchValue(
      {
        startDate: startValue,
        endDate: endValue,
      },
      { emitEvent: false },
    );
  }

  
}
