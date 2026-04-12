import { afterNextRender, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';
import { FormaPago } from '../../../../interfaces/forma-pago.interface';

@Component({
  selector: 'app-forma-pago-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forma-pago-edit.html',
})
export class FormaPagoEdit {

  private formBuilder = inject(FormBuilder);

  formaPago = input<FormaPago>();
  agreeToUpdate = output<FormaPago>();

  protected readonly modalId = computed(() =>
    `editar-forma-pago-modal-${this.formaPago()?.id}`
  );

  form = this.formBuilder.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\s]+$/)
    ]],
    descripcion: ['', [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.,\s]+$/)
    ]],
  });

  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      const data = this.formaPago();
      if (data) {
        this.form.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
        });
      }
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.agreeToUpdate.emit({
      id: this.formaPago()!.id,
      nombre: this.form.value.nombre!,
      descripcion: this.form.value.descripcion!,
    });
  }

  get nombre() { return this.form.get('nombre'); }
  get descripcion() { return this.form.get('descripcion'); }
}