import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-museos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './museos-edit.html',
  styleUrl: './museos-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseosEdit {
  private formBuilder = inject(FormBuilder);

  readonly museo = input<{
    id: number;
    nombre: string;
    responsable: string;
    ubicacion: string;
  }>();

  // Inicializar el formulario vacío
  museoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    responsable: ['', Validators.required],
    ubicacion: ['', Validators.required],
  });

  protected readonly modalId = computed(() => `edit-museo-modal-${this.museo()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    responsable: string;
    ubicacion: string;
  }>();

  constructor() {
    effect(() => {
      const museoData = this.museo();
      if (museoData) {
        this.museoForm.patchValue({
          nombre: museoData.nombre,
          responsable: museoData.responsable,
          ubicacion: museoData.ubicacion,
        });
      }
    });
  }

  onClickAgree() {
    if (this.museoForm.valid) {
      const museoData = this.museo();
      const formData = this.museoForm.value;
      
      // Emitir los datos completos incluyendo el ID
      this.agreeToUpdate.emit({
        id: museoData!.id,
        nombre: formData.nombre!,
        responsable: formData.responsable!,
        ubicacion: formData.ubicacion!,
      });
    }
  }
}
