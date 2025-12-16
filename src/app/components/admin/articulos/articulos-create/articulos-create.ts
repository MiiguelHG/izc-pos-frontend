import { afterNextRender, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';
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
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    tipo: ['', Validators.required],
    precioEstandar: [0, Validators.required],
  });

  agreeToCreate = output<Articulo>();

  constructor() {
    afterNextRender(() => initModals());
  }

  onSubmit() {
    if (!this.articuloForm.valid) {
      return;
    }
    const formData = this.articuloForm.value;

    const payload: Articulo = {
      nombre: formData.nombre!,
      descripcion: formData.descripcion!,
      tipo: formData.tipo as 'producto' | 'servicio' | 'boleto',
      precioEstandar: formData.precioEstandar!,
    }

    this.agreeToCreate.emit(payload);
  }
}
