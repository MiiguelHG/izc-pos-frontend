import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Museo } from '../../../../interfaces/museo.interface';
import { MuseosService } from '../../../../services/museos/museos.service';
import { initModals } from 'flowbite';

@Component({
  selector: 'app-museos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './museos-edit.html',
  styleUrl: './museos-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseosEdit {
  private formBuilder = inject(FormBuilder);

  readonly museo = input<Museo>();

  // Inicializar el formulario vacío
  museoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    responsable: ['', Validators.required],
    ubicacion: ['', Validators.required],
  });

  protected readonly modalId = computed(() => `edit-museo-modal-${this.museo()?.id}`);

  agreeToUpdate = output<Museo>();

  constructor() {
    afterNextRender(() => {
      initModals();
    })

    effect(() => {
      const museoData = this.museo();
      if (museoData) {
        this.museoForm.patchValue({
          nombre: museoData.nombre,
          responsable: "Anonimo", // museoData.responsable,
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
        // responsable: formData.responsable!,
        ubicacion: formData.ubicacion!,
      });
    }
  }
}
