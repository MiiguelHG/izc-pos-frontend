import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-boletos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './boletos-edit.html',
  styleUrl: './boletos-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosEdit {

private formBuilder = inject(FormBuilder);

  readonly boleto = input<{
    id: number;
    nombre: string;
    price: number;
    discount: number;
  }>();

  // Inicializar el formulario vacío
  FormBoletos = this.formBuilder.group({
    nombre: ['', Validators.required],
    price: [0, Validators.required],
    discount: [0, Validators.required],
  });

  protected readonly modalId = computed(() => `edit-boleto-modal-${this.boleto()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    price: number;
    discount: number;
  }>();

  constructor() {
    effect(() => {
      const boletoData = this.boleto();
      if (boletoData) {
        this.FormBoletos.patchValue({
          nombre: boletoData.nombre,
          price: boletoData.price,
          discount: boletoData.discount,

        });
      }
    });
  }

  onClickAgree() {
    if (this.FormBoletos.valid) {
      const boletoData = this.boleto();
      const formData = this.FormBoletos.value;
      
      // Emitir los datos completos incluyendo el ID
      this.agreeToUpdate.emit({
        id: boletoData!.id,
        nombre: formData.nombre!,
        price: formData.price!,
        discount: formData.discount!,
      });
    }
  }
}