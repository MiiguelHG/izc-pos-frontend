import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-servicios-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './servicios-edit.html',
  styleUrl: './servicios-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosEdit {
  private formBuilder = inject(FormBuilder);

  readonly servicio = input<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  // Inicializar el formulario vacío
  servicioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    precio: [0, Validators.required],
    descuento: [0, Validators.required],
  });

  protected readonly modalId = computed(() => `edit-servicio-modal-${this.servicio()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  constructor() {
    effect(() => {
      const servicioData = this.servicio();
      if (servicioData) {
        this.servicioForm.patchValue({
          nombre: servicioData.nombre,
          precio: servicioData.precio,
          descuento: servicioData.descuento,
        });
      }
    });
  }

  onClickAgree() {
    if (this.servicioForm.valid) {
      const servicioData = this.servicio();
      const formData = this.servicioForm.value;
      
      // Emitir los datos completos incluyendo el ID
      this.agreeToUpdate.emit({
        id: servicioData!.id,
        nombre: formData.nombre!,
        precio: formData.precio!,
        descuento: formData.descuento!,
      });
    }
  }
}
