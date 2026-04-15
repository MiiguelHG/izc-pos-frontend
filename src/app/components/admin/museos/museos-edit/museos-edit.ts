import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Museo } from '../../../../interfaces/museo.interface';
import { initModals, Modal } from 'flowbite';
import { Ubicacion } from '../../../../interfaces/ubicacion.interface';

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
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
    ubicacion: this.formBuilder.group({
      calle: [null as string | null, [Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      numero: [null as number | null, [Validators.min(1)]],
      colonia: ['', [Validators.required,Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      ciudad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      estado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      codigoPostal: [null as number | null, [Validators.min(10000), Validators.max(99999)]],
    }),
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
          ubicacion: museoData.ubicacion,
        });
      }
    });
  }

  onClickAgree() {
    if (!this.museoForm.valid || !this.museoForm.get('ubicacion')?.valid) {
      this.museoForm.markAllAsTouched();
      return;
    }

    const museoData = this.museo();
    const formData = this.museoForm.value;
    const u = formData.ubicacion;

    const ubicacionCompleta: Ubicacion = {
      calle: u?.calle ?? null,
      numero: u?.numero ?? null,
      colonia: u?.colonia!,
      ciudad: u?.ciudad!,
      estado: u?.estado!,
      codigoPostal: u?.codigoPostal ?? null,
    };
    
    // Emitir los datos completos incluyendo el ID
    this.agreeToUpdate.emit({
      id: museoData!.id,
      nombre: formData.nombre!,
      // responsable: formData.responsable!,
      ubicacion: ubicacionCompleta,
    });

    const $el = document.getElementById(this.modalId());

    if ($el) {
      new Modal($el, {}, { id: `${this.modalId()}`, override: true }).hide();
    }
  }

  onCancel(): void {
  const museoData = this.museo();
  if (museoData) {
    this.museoForm.patchValue({
      nombre: museoData.nombre,
      ubicacion: museoData.ubicacion,
    });
  }
  this.museoForm.markAsPristine();
  this.museoForm.markAsUntouched();
}

  get nombre() {
    return this.museoForm.get('nombre');
  }

  get calle() {
    return this.museoForm.get('ubicacion.calle');
  }

  get numero() {
    return this.museoForm.get('ubicacion.numero');
  }

  get colonia() {
    return this.museoForm.get('ubicacion.colonia');
  }

  get ciudad() {
    return this.museoForm.get('ubicacion.ciudad');
  }

  get estado() {
    return this.museoForm.get('ubicacion.estado');
  }

  get codigoPostal() {
    return this.museoForm.get('ubicacion.codigoPostal');
  }
}
