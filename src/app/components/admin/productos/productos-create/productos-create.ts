import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-productos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './productos-create.html',
  styleUrl: './productos-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosCreate {
  private formBuilder = inject(FormBuilder);

  productoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    descuento: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  agreeToCreate = output<{
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  onClickAgree() {
    if (this.productoForm.valid) {
      const formData = this.productoForm.value;
      
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        precio: formData.precio!,
        descuento: formData.descuento!,
      });

      this.productoForm.reset({ precio: 0, descuento: 0 });
    }
  }
}
