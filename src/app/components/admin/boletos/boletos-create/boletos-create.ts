import { afterEveryRender, ChangeDetectionStrategy, Component, computed, effect, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { Articulo } from '../../../../interfaces/articulo.interface';

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

  protected boletoEstandar = this.articulosService.boletoEstandar;

  protected boletoBase = computed<Articulo | null>(() => {
    const datos = this.boletoEstandar.value()?.data;
    return datos && datos.length > 0 ? datos[0] : null;
  })

  // Formulario para crear un nuevo boleto
  FormBoletos = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    descuento: this.formBuilder.control<number>(0, [Validators.min(0), Validators.max(100), Validators.required]),
    precioFinal: this.formBuilder.control<number>(0, [Validators.min(0)]),
  });

  agreeToCreate = output<BoletoTipo>();

  constructor() {

    effect(() => {
      // Inicializar el precioFinal con el precioEstandar al cargar el formulario
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
    if (!this.FormBoletos.valid) {
      console.log(`Campos inválidos en el formulario`);
      this.FormBoletos.markAllAsTouched();
      return;
    }

    const formData = this.FormBoletos.value;
    const payload: BoletoTipo = {
      nombre: formData.nombre!,
      descripcion: formData.descripcion ?? '',
      descuento: formData.descuento ?? 0,
      articuloId: this.boletoBase()?.id!,
    }

    this.agreeToCreate.emit(payload);

    // // Identificar campos vacíos
    // const camposVacios: string[] = [];

    // if (this.FormBoletos.get('nombre')?.invalid) {
    //   camposVacios.push('Nombre');
    // }
    // if (this.FormBoletos.get('price')?.invalid) {
    //   camposVacios.push('Precio');
    // }

    // if (!this.FormBoletos.valid ) {
    //   // Si el formulario no es válido, mostrar alerta y NO cerrar
    //       alert(`Por favor completa los siguientes campos: ${camposVacios.join(', ')}`);
    // this.FormBoletos.markAllAsTouched();
    //   return; // Importante: salir aquí para no ejecutar el resto
    // }
    // else {
    //   const formData = this.FormBoletos.value;

    //   // Validar los datos nuevos para el Boleto
    //   this.agreeToCreate.emit({
    //     nombre: formData.nombre!,
    //     precioFinal: formData.precioFinal!,
    //     descuento: formData.descuento ?? 0,
    //   });

    //   // Cerrar el modal haciendo click en el botón de cerrar
    //   const modalElement = document.getElementById('crear-boleto-modal');
    //   const closeButton = modalElement?.querySelector('[data-modal-toggle="crear-boleto-modal"]') as HTMLElement;
    //   if (closeButton) {
    //     closeButton.click();
    //   }
      // Resetear el formulario después de crear
      this.FormBoletos.reset();
    }

    clearForm() {
      this.FormBoletos.reset();
    }

}





