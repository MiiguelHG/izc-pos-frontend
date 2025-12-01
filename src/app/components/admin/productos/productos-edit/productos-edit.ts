import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-productos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './productos-edit.html',
  styleUrl: './productos-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosEdit {
  private formBuilder = inject(FormBuilder);

  readonly producto = input<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  productoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    descuento: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  protected readonly modalId = computed(() => `edit-producto-modal-${this.producto()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  constructor() {
    effect(() => {
      const productoData = this.producto();
      if (productoData) {
        this.productoForm.patchValue({
          nombre: productoData.nombre,
          precio: productoData.precio,
          descuento: productoData.descuento,
        });
      }
    });
  }

  onClickAgree() {
    if (this.productoForm.valid) {
      const productoData = this.producto();
      const formData = this.productoForm.value;
      
      this.agreeToUpdate.emit({
        id: productoData!.id,
        nombre: formData.nombre!,
        precio: formData.precio!,
        descuento: formData.descuento!,
      });
    }
  }
}
