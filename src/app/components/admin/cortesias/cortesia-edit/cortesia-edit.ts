import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals, Modal } from 'flowbite';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { MuseosService } from '../../../../services/museos/museos.service';

@Component({
  selector: 'app-cortesia-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './cortesia-edit.html',
  styleUrl: './cortesia-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaEdit {
  private formBuilder = inject(FormBuilder);
  private museosService = inject(MuseosService);

  readonly invitado = input<Invitado>();

  protected museos = this.museosService.museos;

  protected readonly modalId = computed(() => `edit-cortesia-modal-${this.invitado()?.id}`);

  agreeToUpdate = output<Invitado>();

  invitadoForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\s]+$/)]],
    motivo: ['', [Validators.maxLength(255), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.,\s]+$/)]],
    museoId: [null as number | null, [Validators.required]],
  });

  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      const invitadoData = this.invitado();
      if (invitadoData) {
        this.invitadoForm.patchValue({
          nombre: invitadoData.nombre,
          motivo: invitadoData.motivo,
          museoId: invitadoData.museoId,
        });
      }
    });
  }

  onClickAgree() {
    if (!this.invitadoForm.valid) {
      this.invitadoForm.markAllAsTouched();
      return;
    };

    const invitadoData = this.invitado();
    const formData = this.invitadoForm.value;

    this.agreeToUpdate.emit({
      id: invitadoData!.id,
      nombre: formData.nombre!,
      motivo: formData.motivo!,
      usuarioId: invitadoData!.usuarioId,
      museoId: formData.museoId!,
    });

    const $el = document.getElementById(this.modalId());
    if ($el) {
      new Modal($el, {}, { id: this.modalId(), override: true }).hide();
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
}
