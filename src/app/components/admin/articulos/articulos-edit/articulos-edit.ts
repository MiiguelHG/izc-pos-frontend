import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  output
} from '@angular/core';
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
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
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
    precioEstandar: this.formBuilder.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    )
  });

  protected readonly modalId = computed(() =>
    `editar-articulo-modal-${this.articulo()?.id}`
  );

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
    });
  }

  onSubmit() {
    if (!this.articuloForm.valid) {
      this.articuloForm.markAllAsTouched();
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
    };

    this.agreeToUpdate.emit(payload);
  }

  // GETTERS PARA VALIDACIONES VISUALES
  get nombre() { return this.articuloForm.get('nombre'); }
  get descripcion() { return this.articuloForm.get('descripcion'); }
  get tipo() { return this.articuloForm.get('tipo'); }
  get precioEstandar() { return this.articuloForm.get('precioEstandar'); }
}