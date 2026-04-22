import { afterNextRender, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { initModals } from 'flowbite';

@Component({
  selector: 'app-articulos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './articulos-create.html',
  styleUrl: './articulos-create.css',
})
export class ArticulosCreate {
  private formBuilder = inject(FormBuilder);

  constructor() {
    afterNextRender(() => initModals());
  }

  articuloForm = this.formBuilder.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\s]+$/)
    ]],
    descripcion: ['', [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9.,\s]+$/)
    ]],
    tipo: ['', Validators.required],
    precioEstandar: [null, [
      Validators.required,
      Validators.min(0.01)
    ]],
  });

  agreeToCreate = output<Articulo>();

  // ✅ Constructor eliminado por completo — sin initModals(), sin Flowbite

  onSubmit() {
    if (!this.articuloForm.valid) {
      this.articuloForm.markAllAsTouched();
      return;
    }

    const formData = this.articuloForm.value;

    this.agreeToCreate.emit({
      nombre: formData.nombre!,
      descripcion: formData.descripcion!,
      tipo: formData.tipo as 'producto' | 'servicio' | 'boleto',
      precioEstandar: formData.precioEstandar!,
    });

    this.resetForm();
    this.closeModal();
  }

  onCancel(): void {
    this.resetForm();
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
  private resetForm(): void {
    this.articuloForm.reset({
      nombre: '',
      descripcion: '',
      tipo: '',
      precioEstandar: null,
    });
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
