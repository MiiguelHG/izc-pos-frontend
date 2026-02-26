import { ChangeDetectionStrategy, Component, effect, inject, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';

@Component({
  selector: 'app-boletos-create',
  imports: [ReactiveFormsModule],
  templateUrl: './boletos-create.html',
  styleUrls: ['./boletos-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoletosCreate {
  private articulosService = inject(ArticulosService);
  private formBuilder = inject(FormBuilder);

  protected boletoBase = this.articulosService.boletoBase;

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

  // Formulario para crear un nuevo boleto
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

  agreeToCreate = output<BoletoTipo>();

  constructor() {

    effect(() => {
      // Inicializar el precioFinal con el precioBase al cargar el formulario
      const precioEstandar = this.boletoBase()?.precioEstandar || 0;
      this.FormBoletos.controls.precioFinal.setValue(precioEstandar, { emitEvent: false });
    })

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

    const formData = this.FormBoletos.value;
    const payload: BoletoTipo = {
      nombre: formData.nombre!,
      descripcion: formData.descripcion ?? '',
      descuento: formData.descuento ?? 0,
      esEspecial: formData.esEspecial ?? false,
      dias: diasSeleccionados,
      articuloId: this.boletoBase()?.id!,
    };

    this.agreeToCreate.emit(payload);
    this.FormBoletos.reset();
    this.diasError.set(false);
  }

  clearForm() {
    this.FormBoletos.reset();
    this.diasError.set(false);
  }

}





