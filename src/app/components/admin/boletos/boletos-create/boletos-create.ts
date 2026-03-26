import { afterNextRender, ChangeDetectionStrategy, Component, effect, inject, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { initModals, Modal } from 'flowbite';
import { diasSemana } from '../../../../helpers/index';

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

  protected readonly diasSemana = diasSemana;

  protected diasError = signal(false);

  // Formulario para crear un nuevo boleto
  FormBoletos = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
    descripcion: ['', [Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:!?"'()\-]+$/)]],
    descuento: [0, [Validators.min(0), Validators.max(100)]],
    precioFinal: [0, [Validators.min(0)]],
    esEspecial: [false],
    dias: this.formBuilder.array(new Array(7).fill(false)),
  });

  get diasArray(): FormArray {
    return this.FormBoletos.get('dias') as FormArray;
  }

  agreeToCreate = output<BoletoTipo>();

  constructor() {
    afterNextRender(() => initModals());

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
      this.FormBoletos.markAllAsTouched();
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
    this.clearForm();
    this.diasError.set(false);

    const $el = document.getElementById('crear-boleto-modal');
    if ($el) {
      new Modal($el, {}, { id: 'crear-boleto-modal', override: true }).hide();
    }
  }

  clearForm() {
    const precioEstandar = this.boletoBase()?.precioEstandar || 0;
    this.FormBoletos.reset({
      nombre: '',
      descripcion: '',
      descuento: 0,
      precioFinal: precioEstandar,
      esEspecial: false,
      dias: new Array(7).fill(false),
    });
    this.diasError.set(false);
  }

  get nombre() {
    return this.FormBoletos.get('nombre');
  }

  get descripcion() {
    return this.FormBoletos.get('descripcion');
  }

  get descuento() {
    return this.FormBoletos.get('descuento');
  }

}





