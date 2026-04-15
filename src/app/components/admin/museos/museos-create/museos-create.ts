import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Museo } from '../../../../interfaces/museo.interface';
import { Modal } from 'flowbite';
import { Ubicacion } from '../../../../interfaces/ubicacion.interface';

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
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
    ubicacion: this.formBuilder.group({
      calle: [null as string | null, [Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      numero: [null as number | null, [Validators.min(1)]],
      colonia: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      ciudad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      estado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,()]+$/)]],
      codigoPostal: [null as number | null, [Validators.min(10000), Validators.max(99999)]],
    }),
  });

  agreeToCreate = output<Museo>();

  onClickAgree() {
    if (!this.museoForm.valid || !this.museoForm.get('ubicacion')?.valid) {
      this.museoForm.markAllAsTouched();
      return;
    }

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


    // Emitir los datos del nuevo museo
    this.agreeToCreate.emit({
      nombre: formData.nombre!,
      // responsable: formData.responsable!,
      ubicacion: ubicacionCompleta,
    });

    // Resetear el formulario después de crear
    this.museoForm.reset();

    const $el = document.getElementById('create-museo-modal');
    if ($el) {
      new Modal($el, {}, { id: 'create-museo-modall', override: true }).hide();
    }
  }


  onCancel(): void {
    this.museoForm.reset();
    this.closeModal();
  }

  private closeModal(): void {
    const modal = document.getElementById('crear-articulo-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Flowbite inyecta el backdrop con este atributo
    document.querySelectorAll('[modal-backdrop]').forEach(el => el.remove());

    // A veces lo inyecta como clase en lugar de atributo
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    // Quitar bloqueo del scroll
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = '';
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
