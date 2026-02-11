import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { initModals } from 'flowbite';
@Component({
  selector: 'app-boletos-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './boletos-edit.html',
  styleUrl: './boletos-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosEdit {
  private articulosService = inject(ArticulosService);
  private formBuilder = inject(FormBuilder);

  protected boletoBase = this.articulosService.boletoBase;
  
  readonly boleto = input<BoletoTipo>();

  // Inicializar el formulario vacío
  FormBoletos = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    descuento: this.formBuilder.control<number>(0, [Validators.min(0), Validators.max(100), Validators.required]),
    precioFinal: this.formBuilder.control<number>(0, [Validators.min(0)]),
    esEspecial: [false, Validators.required],
  });

  protected readonly modalId = computed(() => `edit-boleto-modal-${this.boleto()?.id}`);

  agreeToUpdate = output<BoletoTipo>();

  constructor() {
    afterNextRender(() => {
      initModals();
    })

    effect(() => {
      const boletoData = this.boleto();
      if (boletoData) {
        this.FormBoletos.patchValue({
          nombre: boletoData.nombre,
          descripcion: boletoData.descripcion || '',
          descuento: boletoData.descuento,
          precioFinal: boletoData.precioFinal,
          esEspecial: boletoData.esEspecial,
        });
      }
    });

    // Recalcular cuando cambie el descuento
    this.FormBoletos.controls.descuento.valueChanges.subscribe(() => {
      const precioEstandar = this.boletoBase()?.precioEstandar || 0;
      const descuento = this.FormBoletos.controls.descuento.value ?? 0;
      
      const precioFinal = precioEstandar * (1 - descuento / 100);
      this.FormBoletos.controls.precioFinal.setValue(precioFinal, { emitEvent: false });
    });
  }

  onClickAgree() {
    if (!this.FormBoletos.valid) {
      console.log(`Campos inválidos en el formulario`);
      return;
    }

    const boletoData = this.boleto();
    const formData = this.FormBoletos.value;
    
    // Emitir los datos completos incluyendo el ID
    this.agreeToUpdate.emit({
      id: boletoData!.id!,
      nombre: formData.nombre!,
      descripcion: formData.descripcion!,
      descuento: formData.descuento!,
      esEspecial: formData.esEspecial!,
      articuloId: boletoData!.articuloId!
    });
  }
}