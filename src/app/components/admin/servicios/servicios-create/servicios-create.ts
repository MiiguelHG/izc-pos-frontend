import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-servicios-create',
  imports: [ReactiveFormsModule],
  templateUrl: './servicios-create.html',
  styleUrls: ['./servicios-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosCreate {
  private formBuilder = inject(FormBuilder);

  // Formulario para crear un nuevo servicio
  servicioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    precio: [0, Validators.required],
    descuento: [0, Validators.required],
  });

  // Output con el tipo correcto
  agreeToCreate = output<{ nombre: string; precio: number; descuento: number }>();

  onClickAgree() {
    if (this.servicioForm.valid) {
      const formData = this.servicioForm.value;
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        precio: formData.precio!,
        descuento: formData.descuento!,
      });

      this.servicioForm.reset();
    }
  }
}
