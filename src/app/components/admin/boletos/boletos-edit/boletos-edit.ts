import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
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

  protected readonly diasSemana = [
    { id: 0, nombre: 'D' },
    { id: 1, nombre: 'L' },
    { id: 2, nombre: 'M' },
    { id: 3, nombre: 'Mi' },
    { id: 4, nombre: 'J' },
    { id: 5, nombre: 'V' },
    { id: 6, nombre: 'S' },
  ];

  protected diasError = signal(false);

  // Inicializar el formulario vacío
  FormBoletos = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    descuento: this.formBuilder.control<number>(0, [Validators.min(0), Validators.max(100), Validators.required]),
    precioFinal: this.formBuilder.control<number>(0, [Validators.min(0)]),
    esEspecial: [false],
    dias: this.formBuilder.array(new Array(7).fill(false)),
  });

  get diasArray(): FormArray {
    return this.FormBoletos.get('dias') as FormArray;
  }

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

        // Marcar los días que ya tiene el boleto
        const diasActivos = boletoData.dias ?? [];
        this.diasArray.controls.forEach((ctrl, index) => {
          ctrl.setValue(diasActivos.includes(index), { emitEvent: false });
        });
        this.diasError.set(false);
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
    const diasSeleccionados = this.diasArray.value
      .map((checked: boolean, index: number) => checked ? index : null)
      .filter((v: number | null): v is number => v !== null);

    if (diasSeleccionados.length === 0) {
      this.diasError.set(true);
      return;
    }
    this.diasError.set(false);

    if (!this.FormBoletos.valid) {
      this.FormBoletos.markAllAsTouched();
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
      dias: diasSeleccionados,
      articuloId: boletoData!.articuloId!
    });
  }
}