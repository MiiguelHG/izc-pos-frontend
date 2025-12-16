import { afterNextRender, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { initModals } from 'flowbite';
import { Articulo } from '../../../../interfaces/articulo.interface';

@Component({
  selector: 'app-articulos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './articulos-edit.html',
  styleUrl: './articulos-edit.css',
})
export class ArticulosEdit {
  private formBuilder = inject(FormBuilder);

  articulo = input<Articulo>();

  articuloForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    tipo: ['', Validators.required],
    precioEstandar: [0, Validators.required],
  })

  protected readonly modalId = computed(() => `editar-articulo-modal-${this.articulo()?.id}`);

  agreeToUpdate = output<Articulo>();

  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      const articuloData = this.articulo();
      if (articuloData) {
        this.articuloForm.patchValue({
          nombre: articuloData.nombre,
          descripcion: articuloData.descripcion,
          tipo: articuloData.tipo,
          precioEstandar: articuloData.precioEstandar,
        });
      }
    })
  }

  onSubmit() {
    if (!this.articuloForm.valid) {
      return;
    }

    const articuloData = this.articulo();
    const formData = this.articuloForm.value;

    const payload: Articulo = {
      id: articuloData?.id!,
      nombre: formData.nombre!,
      descripcion: formData.descripcion!,
      tipo: formData.tipo as 'producto' | 'servicio' | 'boleto',
      precioEstandar: formData.precioEstandar!,
    }

    this.agreeToUpdate.emit(payload);
  }
}
