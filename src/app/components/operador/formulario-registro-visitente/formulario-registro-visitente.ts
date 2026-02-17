import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule} from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { Visitante } from '../../../interfaces/visitante.interface';
import { DipomexService } from '../../../services/dipomex/dipomex.service';
import { initFlowbite } from 'flowbite';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrentVentaBoletoService } from '../../../services/currentVentaBoleto/current-venta-boleto.service';
import { InvitadosPendientesService } from '../../../services/invitados/invitados-pendientes.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-formulario-registro-visitente',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './formulario-registro-visitente.html',
  styleUrl: './formulario-registro-visitente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioRegistroVisitente {
  private authService = inject(AuthService);
  private currentVentaBoletoService = inject(CurrentVentaBoletoService);
  private dipomexService = inject(DipomexService);
  private invitadoService = inject(InvitadosPendientesService);

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected isGroup = new FormControl<Boolean>(false);
  protected unVisitante = new FormControl<string>('');
  protected codigoInvitacion = new FormControl<number | null>(null);
  private nextRoute = signal<string>('');

  protected invitado = this.invitadoService.invitado;
  protected user = this.authService.user;
  protected estados = this.dipomexService.estados;
  protected cpInfo = this.dipomexService.cpInfo;

  protected errorMessage = computed(() => {
    const error = this.invitado.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al buscar la cortesía';
    return null;
  });

  constructor() {
    afterNextRender(() => initFlowbite());

    this.activatedRoute.queryParams
    .pipe(takeUntilDestroyed())
    .subscribe(params => {
      this.nextRoute.set(params['next'] ? params['next'] : '');
    });

    this.isGroup.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(value => {
        this.formVisitante.patchValue({cantidadHombres: null, cantidadMujeres: null, cantidadOtros: null});
        this.unVisitante.setValue('');
    });

    this.unVisitante.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(value => {
      if (value === 'hombre') {
        this.formVisitante.patchValue({cantidadHombres: 1, cantidadMujeres: 0, cantidadOtros: 0});
      }
      else if (value === 'mujer') {
        this.formVisitante.patchValue({cantidadMujeres: 1, cantidadHombres: 0, cantidadOtros: 0});
      }
      else if (value === 'otro') {
        this.formVisitante.patchValue({cantidadOtros: 1, cantidadHombres: 0, cantidadMujeres: 0});
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

    effect(() => {
      if (this.errorMessage()) {
        return;
      }

      const invitado = this.invitado.hasValue() ? this.invitado.value()?.data : null;

      if (invitado?.nombre) {
        this.formVisitante.patchValue({
          nombre: invitado.nombre,
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
    cantidadHombres: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),
    cantidadMujeres: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),
    cantidadOtros: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),
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

    const invitadoData = this.invitado.hasValue() ? this.invitado.value()?.data : null;

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
      totalVisitantes: (visitanteData.cantidadHombres ?? 0) + (visitanteData.cantidadMujeres ?? 0) + (visitanteData.cantidadOtros ?? 0),
      museoId: this.user()?.museoId!,
      usuarioId: this.user()?.id!
    };

    this.currentVentaBoletoService.state.set({ visitante: visitantesPayload, invitadoId: invitadoData?.id ?? null });

    if (invitadoData) {
      this.onLimpiarCortesia();
    }

    // Limpiar el formulario antes de navegar
      this.formVisitante.reset();
      this.isGroup.reset(false);
      this.dipomexService.cp.set('');

      this.router.navigate([`/operador/${this.nextRoute()}`]);
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


  onLimpiarCortesia(): void {
    this.invitadoService.clearInvitado();
    this.formVisitante.patchValue({
      nombre: '',
    });
  }

  buscarInvitado(): void {
    const codigo = this.codigoInvitacion.value;
    if (!codigo) {
      return;
    }

    const museoId = this.user()?.museoId;
    // this.invitadoService.getInvitadoById(codigo, museoId!);
    this.invitadoService.getInvitacion(codigo, museoId!);
    this.codigoInvitacion.reset();
  }
}