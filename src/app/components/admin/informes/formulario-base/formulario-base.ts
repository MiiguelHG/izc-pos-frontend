import { afterNextRender, ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoInforme } from '../../../../interfaces/tipo-informe.type';
import { ActivatedRoute, Router } from '@angular/router';
import { InformesService } from '../../../../services/informes/informes.service';
import { InformeVisitante } from '../../../../interfaces/informe-visitante.interface';
import { MuseosService } from '../../../../services/museos/museos.service';
import { DipomexService } from '../../../../services/dipomex/dipomex.service';
import { initFlowbite } from 'flowbite';
import { ChartVisitantes } from "../chart-visitantes/chart-visitantes";

@Component({
  selector: 'app-formulario-base',
  imports: [ReactiveFormsModule, ChartVisitantes],
  providers: [MuseosService],
  templateUrl: './formulario-base.html',
  styleUrl: './formulario-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioBase {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private informeService = inject(InformesService);
  private museoService = inject(MuseosService);
  private dipomexService = inject(DipomexService);

  protected informe = this.informeService.informe;
  protected informeError = this.informeService.informeError;
  protected museos = this.museoService.museos;
  protected estados = this.dipomexService.estados;

  protected generoValue = signal<'masculino' | 'femenino' | 'otro' |  '' | null>(null);

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
  });

  constructor() {

    afterNextRender(() => {
      initFlowbite();
      const startElement = this.startDateInput()?.nativeElement;
      const endElement = this.endDateInput()?.nativeElement;

      if (!startElement || !endElement) {
        return;
      }

      const sync = () => this.syncDateInputs();

      startElement.addEventListener('input', sync);
      startElement.addEventListener('change', sync);
      endElement.addEventListener('input', sync);
      endElement.addEventListener('change', sync);

      this.syncDateInputs();
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
      }, { emitEvent: false });

      this.generoValue.set((params['genero'] as 'masculino' | 'femenino' | 'otro' | '' | undefined) ?? null);
      
    });

    effect(() => {
      if (this.informe()) {
        console.log('Informe actualizado:', this.informe());
      }

    });
  }

  onSubmit() {
    this.informeService.clearInforme();

    this.syncDateInputs();
    const formValues = this.informeForm.value;
    const tipo = this.tipoReporte.value!;
    
    const v = formValues.visitantes;
    this.generoValue.set(v?.genero ?? null);

    const informeParams: InformeVisitante = {
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

    const cleanedParams: Record<string, string | number> = informeParams as Record<string, string | number>;

    // 4. Actualizar la URL para persistir los filtros (no dispara petición)
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: cleanedParams,
      queryParamsHandling: 'merge'
    });

    this.informeService.getInformeVisitantes(cleanedParams, tipo);

  }

  private syncDateInputs() {
    const startValue = this.startDateInput()?.nativeElement.value ?? '';
    const endValue = this.endDateInput()?.nativeElement.value ?? '';

    this.informeForm.patchValue(
      {
        fechaInicio: startValue,
        fechaFin: endValue,
      },
      { emitEvent: false },
    );
  }
  
}
