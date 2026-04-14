import { afterNextRender, ChangeDetectionStrategy, Component, effect, inject, output } from '@angular/core';
import { initFlowbite, initModals, Modal } from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';

@Component({
  selector: 'app-cortesia-create',
  imports: [ReactiveFormsModule],
  templateUrl: './cortesia-create.html',
  styleUrl: './cortesia-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaCreate {
  private museosService = inject(SelectMuseos);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  protected museos = this.museosService.museos;
  protected usuario = this.authService.user;

  invitadoToCreate = output<Invitado>();

  invitadoForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\s]+$/)]],
    motivo: ['', [Validators.maxLength(255), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.,\s]+$/)]],
    museoId: [null as number | null, [Validators.required]],
  });


  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      if (this.usuario()?.rol.nombre !== 'admin') {
        this.invitadoForm.get('museoId')?.setValue(this.usuario()?.museoId!);
        this.invitadoForm.get('museoId')?.disable();
      }
    })
  }

  agreeToCreate() {
    if (!this.invitadoForm.valid) {
      this.invitadoForm.markAllAsTouched();
      return;
    }

    const formData = this.invitadoForm.value;

    this.invitadoToCreate.emit({
      nombre: formData.nombre!,
      motivo: formData.motivo!,
      usuarioId: this.usuario()?.id!,
      museoId: formData.museoId!,
    });

    this.invitadoForm.reset();
    const $el = document.getElementById('crear-cortesia-modal');
    if ($el) {
      new Modal($el, {}, { id: 'crear-cortesia-modal', override: true }).hide();
    }
  }

  onCancel(): void {
    this.invitadoForm.reset();
    this.closeModal();
  }

  private closeModal(): void {
    const modal = document.getElementById('crear-cortesia-modal');
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
    return this.invitadoForm.get('nombre');
  }

  get motivo() {
    return this.invitadoForm.get('motivo');
  }

  get museoId() {
    return this.invitadoForm.get('museoId');
  }

  limpiarFormulario() {
    this.invitadoForm.reset();
  }
}
