import { afterNextRender, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';
import { FormaPago } from '../../../../interfaces/forma-pago.interface';

@Component({
  selector: 'app-forma-pago-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forma-pago-create.html',
})
export class FormaPagoCreate {

  private formBuilder = inject(FormBuilder);

  agreeToCreate = output<Omit<FormaPago, 'id'>>();

  protected readonly modalId = 'crear-forma-pago-modal';

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
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.agreeToCreate.emit({
      nombre: this.form.value.nombre!,
      descripcion: this.form.value.descripcion!,
    });
    this.form.reset();
  }

  get nombre() { return this.form.get('nombre'); }
  get descripcion() { return this.form.get('descripcion'); }
}