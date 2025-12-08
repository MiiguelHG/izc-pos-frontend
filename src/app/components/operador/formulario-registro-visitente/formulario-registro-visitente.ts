import { ChangeDetectionStrategy, Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule} from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { VisitantesService } from '../../../services/visitantes/visitantes.service';
import { Visitante } from '../../../interfaces/visitante.interface';
import { DipomexService } from '../../../services/dipomex/dipomex.service';

//Exportar variables para la impresión de tickets
export let nombreVisitante = '';
export let ExportTotalVisitantes = 0;
export let ExportFechaEmision = '';
export let bandera = 0;

@Component({
  selector: 'app-formulario-registro-visitente',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './formulario-registro-visitente.html',
  styleUrl: './formulario-registro-visitente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioRegistroVisitente {
  private authService = inject(AuthService);
  private visitantesService = inject(VisitantesService);
  private dipomexService = inject(DipomexService);

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected isGroup = new FormControl(false);
  private nextRoute = signal<string>('');

  protected visitanteCreated = this.visitantesService.visitanteCreated;
  protected user = this.authService.user;
  protected estados = this.dipomexService.estados;
  protected cpInfo = this.dipomexService.cpInfo;

  //Emitir el componente del estado al formulario padre
  @Output() formStatusChange = new EventEmitter<boolean>();
  [x: string]: any;

  constructor() {
    // Limpiar el signal al inicializar el componente
    this.visitantesService.clearVisitanteCreated();

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.nextRoute.set(params.get('next') || '');
    })
    
    effect(() => {
      if (this.visitanteCreated()) {
        // Limpiar el formulario antes de navegar
        this.formVisitante.reset();
        this.isGroup.reset(false);
        this.dipomexService.cp.set('');
        
        this.router.navigate([`/operador/${this.nextRoute()}`], {
          queryParams: { 
            visitanteId: this.visitanteCreated()!.id ,
            totalVisitantes: this.visitanteCreated()!.totalVisitantes
          }
        });
      }
    });

    // Effect separado para manejar la respuesta del CP
    effect(() => {
      const cpData = this.cpInfo.value()?.data;
      if (cpData?.estado) {
        this.formVisitante.patchValue({
          municipio: cpData.municipio,
          estado: cpData.estado_abreviatura,
          pais: 'MX'
        });
      }
    });
   }


  // Formulario para crear un nuevo visitante
  formVisitante = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    edad: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100)]),
    cp: this.formBuilder.control<number | null>(null, [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.max(99999)]),
    pais: ['', Validators.required],
    estado: ['', Validators.required],
    municipio: ['', Validators.required],
    cantidadHombres: this.formBuilder.control<number | null>(null, [Validators.max(1000), Validators.min(0)]),
    cantidadMujeres: this.formBuilder.control<number | null>(null, [Validators.max(1000), Validators.min(0)]),
    cantidadOtros: this.formBuilder.control<number | null>(null, [Validators.max(1000), Validators.min(0)]),
  }, { validators: this.alMenosUnoConValor.bind(this) });

  alMenosUnoConValor(control: AbstractControl): ValidationErrors | null {
    const hombre = control.get('cantidadHombres')?.value;
    const mujer = control.get('cantidadMujeres')?.value;
    const otro = control.get('cantidadOtros')?.value;

    const tieneAlMenosUno = (hombre > 0) || (mujer > 0) || (otro > 0);
    return tieneAlMenosUno ? null : { alMenosUno: true };
  }

  onRegistrarVisitante(): void {
    if (!this.formVisitante.valid) {
      return;
    }

    const visitanteData = this.formVisitante.value;

    const visitantesPayload: Visitante = {
      nombre: visitanteData.nombre!,
      edad: visitanteData.edad!,
      cp: visitanteData.cp!,
      pais: visitanteData.pais!,
      estado: visitanteData.estado!,
      municipio: visitanteData.municipio!,
      cantidadHombres: visitanteData.cantidadHombres ?? 0,
      cantidadMujeres: visitanteData.cantidadMujeres ?? 0,
      cantidadOtros: visitanteData.cantidadOtros ?? 0,
      museoId: this.user()?.museoId!,
      usuarioId: this.user()?.id!
    };

    this.visitantesService.registrarVisitante(visitantesPayload);
  }

  actualizarVisitante(event: Event): void {
    event.preventDefault();

    const select = event.target as HTMLSelectElement;
    // Actualizar el formulario según la selección

    const generoSeleccionado = select.value;

    if (generoSeleccionado === 'hombre') {
    this.formVisitante.patchValue({cantidadHombres: 1, cantidadMujeres: 0, cantidadOtros: 0});
    }
    else if (generoSeleccionado === 'mujer') {
      this.formVisitante.patchValue({cantidadMujeres: 1, cantidadHombres: 0, cantidadOtros: 0});
    }
    else if (generoSeleccionado === 'otro') {
      this.formVisitante.patchValue({cantidadOtros: 1, cantidadHombres: 0, cantidadMujeres: 0});
    }
  }
  get formularioValido(): boolean {
    return this.formVisitante.valid;
  }

  get nombre() {
    return this.formVisitante.get('nombre');
  }

  onCpBlur(): void {
    const cpValue = this.formVisitante.get('cp')?.value;
    
    // Solo buscar si el CP tiene exactamente 5 dígitos
    if (cpValue && cpValue.toString().length === 5) {
      this.dipomexService.cp.set(cpValue.toString());
    }
  }
}