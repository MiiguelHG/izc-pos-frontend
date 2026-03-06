import { afterNextRender, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals, Modal } from 'flowbite';
import { Articulo } from '../../../../interfaces/articulo.interface';

@Component({
  selector: 'app-articulos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './articulos-create.html',
  styleUrl: './articulos-create.css',
})
export class ArticulosCreate {
  private formBuilder = inject(FormBuilder);

  articuloForm = this.formBuilder.group({
  nombre: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\s]+$/)
    ]
  ],
  descripcion: [
    '',
    [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.,\s]+$/)
    ]
  ],
  tipo: ['', Validators.required],
  precioEstandar: [
    null,
    [
      Validators.required,
      Validators.min(0.01)
    ]
  ],
});

  agreeToCreate = output<Articulo>();

  constructor() {
    afterNextRender(() => initModals());
  }

  onSubmit() {
  if (!this.articuloForm.valid) {
    this.articuloForm.markAllAsTouched();
    return;
  }

  const formData = this.articuloForm.value;

  this.agreeToCreate.emit({
    nombre: formData.nombre!,
    descripcion: formData.descripcion!,
    tipo: formData.tipo as 'producto' | 'servicio'| 'boleto',
    precioEstandar: formData.precioEstandar!,
  });

  // 🔥 Resetear formulario
  this.articuloForm.reset();

  // 🔥 Cerrar modal manualmente
  const $el = document.getElementById('crear-articulo-modal');

  if ($el) {
    const modal = new Modal($el, {}, { id: 'crear-articulo-modal', override: true });
    modal.hide();
  }
}

get nombre() {
  return this.articuloForm.get('nombre');
}

get descripcion() {
  return this.articuloForm.get('descripcion');
}

get tipo() {
  return this.articuloForm.get('tipo');
}

get precioEstandar() {
  return this.articuloForm.get('precioEstandar');
}

}
