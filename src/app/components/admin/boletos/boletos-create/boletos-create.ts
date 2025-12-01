import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-boletos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './boletos-create.html',
  styleUrls: ['./boletos-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosCreate {
  private formBuilder = inject(FormBuilder);

  // Formulario para crear un nuevo boleto
  FormBoletos = this.formBuilder.group({
    nombre: ['', Validators.required],
    price: [, Validators.required],
    discount: [0, Validators.required],
  });

  agreeToCreate = output<{
    nombre: string;
    price: number;
    discount: number;
  }>();

  onClickAgree(event: Event) {

    // Identificar campos vacíos
    const camposVacios: string[] = [];

    if (this.FormBoletos.get('nombre')?.invalid) {
      camposVacios.push('Nombre');
    }
    if (this.FormBoletos.get('price')?.invalid) {
      camposVacios.push('Precio');
    }

    if (!this.FormBoletos.valid ) {
      // Si el formulario no es válido, mostrar alerta y NO cerrar
          alert(`Por favor completa los siguientes campos: ${camposVacios.join(', ')}`);
    this.FormBoletos.markAllAsTouched();
      return; // Importante: salir aquí para no ejecutar el resto
    }
    else {
      const formData = this.FormBoletos.value;

      // Validar los datos nuevos para el Boleto
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        price: formData.price!,
        discount: formData.discount ?? 0,
      });

      // Cerrar el modal haciendo click en el botón de cerrar
      const modalElement = document.getElementById('crear-boleto-modal');
      const closeButton = modalElement?.querySelector('[data-modal-toggle="crear-boleto-modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
      // Resetear el formulario después de crear
      this.FormBoletos.reset();
    }

  }
}
  /*onClickAgree() {
    if (this.FormBoletos.valid) {
      const formData = this.FormBoletos.value;

      // Emitir los datos del nuevo museo
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        price: formData.price!,
        discount: formData.discount!,
      });
      // Resetear el formulario después de crear
      this.FormBoletos.reset();
    }
  }*/




