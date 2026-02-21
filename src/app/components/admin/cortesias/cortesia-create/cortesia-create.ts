import { afterNextRender, ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { initModals, Modal, ModalInterface} from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cortesia-create',
  imports: [ReactiveFormsModule],
  templateUrl: './cortesia-create.html',
  styleUrl: './cortesia-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaCreate {
  private museosService = inject(MuseosService);
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
  }

  agreeToCreate() {
    if (!this.invitadoForm.valid){
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
