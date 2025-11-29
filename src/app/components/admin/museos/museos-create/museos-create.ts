import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-museos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './museos-create.html',
  styleUrl: './museos-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseosCreate {
  private formBuilder = inject(FormBuilder);

  // Formulario para crear un nuevo museo
  museoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    responsable: ['', Validators.required],
    ubicacion: ['', Validators.required],
  });

  agreeToCreate = output<{
    nombre: string;
    responsable: string;
    ubicacion: string;
  }>();

  onClickAgree() {
    if (this.museoForm.valid) {
      const formData = this.museoForm.value;
      
      // Emitir los datos del nuevo museo
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        responsable: formData.responsable!,
        ubicacion: formData.ubicacion!,
      });

      // Resetear el formulario después de crear
      this.museoForm.reset();
    }
  }
}
