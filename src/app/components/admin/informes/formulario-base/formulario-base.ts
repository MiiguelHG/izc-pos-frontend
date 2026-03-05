import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoInforme } from '../../../../interfaces/tipo-informe.type';
import { ActivatedRoute, Router } from '@angular/router';
import { InformesService } from '../../../../services/informes/informes.service';
import { InformeVisitante } from '../../../../interfaces/informe-visitante.interface';
import { DipomexService } from '../../../../services/dipomex/dipomex.service';
import { initFlowbite } from 'flowbite';
import { ChartVisitantes } from "../chart-visitantes/chart-visitantes";
import { InformeIngresos } from '../../../../interfaces/informe-ingresos.interface';
import { ChartIngresos } from "../chart-ingresos/chart-ingresos";
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';

@Component({
  selector: 'app-formulario-base',
  imports: [ReactiveFormsModule, ChartVisitantes, ChartIngresos],
  providers: [SelectMuseos],
  templateUrl: './formulario-base.html',
  styleUrl: './formulario-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioBase {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private informeService = inject(InformesService);
  private museoService = inject(SelectMuseos);
  private dipomexService = inject(DipomexService);
  private formaPagoService = inject(FormaPagoService);

  protected informe = this.informeService.informe;
  protected informeIngresos = this.informeService.informeIngresos;
  protected informeError = this.informeService.informeError;
  protected museos = this.museoService.museos;
  protected formasPago = this.formaPagoService.formasPago;
  protected estados = this.dipomexService.estados;

  private readonly startDateInput = viewChild<ElementRef<HTMLInputElement>>('startDateInput');
  private readonly endDateInput = viewChild<ElementRef<HTMLInputElement>>('endDateInput');

  protected tipoReporte = new FormControl<TipoInforme>('visitantes');
  
  informeForm = this.formBuilder.group({
    fechaInicio: [''],
    fechaFin: [''],
    museoId: [null as number | null],
    visitantes: this.formBuilder.group({
      edadMin: [null as number | null, Validators.min(1)],
      edadMax: [null as number | null, Validators.max(100)],
      genero: ['' as 'masculino' | 'femenino' | 'otro' | ''],
      cp: [''],
      municipio: [''],
      estado: [''],
      nacionalidad: [''],
    }),
    ingresos: this.formBuilder.group({
      tipo: ['' as 'boletos' | 'productos' | 'eventos' | ''],
      formaPagoId: [null as null | number],
    }),
  });

  constructor() {

    afterNextRender(() => {
      const startElement = this.startDateInput()?.nativeElement;
      const endElement = this.endDateInput()?.nativeElement;
      
      if (!startElement || !endElement) {
        return;
      }
      
      const sync = () => this.syncDateInputs();
      const events: Array<keyof HTMLElementEventMap | 'changeDate'> = ['input', 'change', 'blur', 'changeDate'];
      
      for (const eventName of events) {
        startElement.addEventListener(eventName, sync as EventListener);
        endElement.addEventListener(eventName, sync as EventListener);
      }
      
      this.destroyRef.onDestroy(() => {
        for (const eventName of events) {
          startElement.removeEventListener(eventName, sync as EventListener);
          endElement.removeEventListener(eventName, sync as EventListener);
        }
      });
      
      this.syncDateInputs();
      initFlowbite();
    });

    // Solo sincroniza la URL con el formulario visual (no dispara petición)
    this.activatedRoute.queryParams.subscribe(params => {
      this.informeForm.patchValue({
        fechaInicio: params['fechaInicio'] || '',
        fechaFin: params['fechaFin'] || '',
        museoId: params['museoId'] ? Number(params['museoId']) : null,
        visitantes: {
          edadMin: params['edadMin'] ? Number(params['edadMin']) : null,
          edadMax: params['edadMax'] ? Number(params['edadMax']) : null,
          genero: params['genero'] || '',
          cp: params['cp'] || '',
          municipio: params['municipio'] || '',
          estado: params['estado'] || '',
          nacionalidad: params['nacionalidad'] || '',
        },
        ingresos: {
          tipo: params['tipo'] || '',
          formaPagoId: Number(params['formaPagoId']) || null,
        }
      }, { emitEvent: false });
      
    });

    this.informeForm.valueChanges.subscribe(value => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          fechaInicio: value.fechaInicio || null,
          fechaFin: value.fechaFin || null,
          museoId: value.museoId != null ? value.museoId : null,
          edadMin: value.visitantes?.edadMin != null ? value.visitantes.edadMin : null,
          edadMax: value.visitantes?.edadMax != null ? value.visitantes.edadMax : null,
          genero: value.visitantes?.genero || null,
          cp: value.visitantes?.cp || null,
          municipio: value.visitantes?.municipio || null,
          estado: value.visitantes?.estado || null,
          nacionalidad: value.visitantes?.nacionalidad || null,
          tipo: value.ingresos?.tipo || null,
          formaPagoId: value.ingresos?.formaPagoId || null,
        }
      });
    });
  }

  onSubmit() {
    this.informeService.clearInforme();

    const formValues = this.informeForm.value;
    const tipo = this.tipoReporte.value!;

    let informeParams: InformeVisitante | InformeIngresos;

    if (tipo === 'ingresos') {
      const i = formValues.ingresos;

      informeParams = {
        ...(formValues.fechaInicio && { fechaInicio: formValues.fechaInicio }),
        ...(formValues.fechaFin && { fechaFin: formValues.fechaFin }),
        ...(formValues.museoId != null && { museoId: formValues.museoId }),
        ...(i?.tipo && { tipo: i.tipo }),
        ...(i?.formaPagoId != null && { formaPagoId: i.formaPagoId }),
      };
      this.informeService.getInformeIngresos(informeParams);
    } else {
      const v = formValues.visitantes;

      informeParams = {
        ...(formValues.fechaInicio && { fechaInicio: formValues.fechaInicio }),
        ...(formValues.fechaFin && { fechaFin: formValues.fechaFin }),
        ...(formValues.museoId != null && { museoId: formValues.museoId }),
        ...(v?.edadMin != null && { edadMin: v.edadMin }),
        ...(v?.edadMax != null && { edadMax: v.edadMax }),
        ...(v?.genero && { genero: v.genero }),
        ...(v?.cp && { cp: v.cp }),
        ...(v?.municipio && { municipio: v.municipio }),
        ...(v?.estado && { estado: v.estado }),
        ...(v?.nacionalidad && { nacionalidad: v.nacionalidad }),
      };
      this.informeService.getInformeVisitantes(informeParams);

    }

  }

  private syncDateInputs() {
    const startValue = this.startDateInput()?.nativeElement.value ?? '';
    const endValue = this.endDateInput()?.nativeElement.value ?? '';

    if (
      this.informeForm.controls.fechaInicio.value === startValue &&
      this.informeForm.controls.fechaFin.value === endValue
    ) {
      return;
    }

    this.informeForm.patchValue(
      {
        fechaInicio: startValue,
        fechaFin: endValue,
      },
      { emitEvent: true },
    );
  }
  
}
