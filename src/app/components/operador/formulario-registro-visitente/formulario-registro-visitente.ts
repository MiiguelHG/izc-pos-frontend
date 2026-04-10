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
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-formulario-registro-visitente',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  providers: [InvitadosPendientesService],
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
  public router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private registrarEventoService = inject(RegistrarEventoService);

  protected isGroup = new FormControl<Boolean>(false);
  protected unVisitante = new FormControl<string>('');
  protected codigoInvitacion = new FormControl<number | null>(null);
  // private nextRoute = signal<string>('');

  protected invitado = this.invitadoService.invitado;
  protected user = this.authService.user;
  protected paises = this.dipomexService.paises;
  protected estados = this.dipomexService.estados;
  protected municipios = this.dipomexService.municipios;
  protected cpInfo = this.dipomexService.cpInfo;
  protected readonly paisEsMexico = signal(false);

  protected errorMessage = computed(() => {
    const error = this.invitado.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al buscar la cortesía';
    return null;
  });

  constructor() {

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

    this.formVisitante.get('estado')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(estadoId => {
      // Limpiar el municipio cuando cambie el estado
      // this.formVisitante.patchValue({ municipio: null });
      this.dipomexService.setMunicipioId(estadoId);
    });

    this.formVisitante.get('cp')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(cp => {
      const cpValue = cp?.toString().trim() ?? '';
      const esCpValido = /^\d{5}$/.test(cpValue);
      this.dipomexService.setCp(esCpValido ? cpValue : null);
    });

    this.formVisitante.get('pais')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe((pais) => {
      const esMexico = this.esPaisMexico(pais);
      this.paisEsMexico.set(esMexico);

      if (!esMexico) {
        this.formVisitante.patchValue({ estado: null, municipio: null });
        this.dipomexService.setMunicipioId(null);
      }
    });

    this.paisEsMexico.set(this.esPaisMexico(this.formVisitante.get('pais')?.value));

    // Effect separado para manejar la respuesta del CP
    effect(() => {
      const cpData = this.cpInfo.value()?.data;
      if (cpData?.cp) {
        this.formVisitante.patchValue({
          municipio: cpData.municipioId,
          estado: cpData.estadoId,
          pais: 'México'
        });
      } else {
        this.formVisitante.patchValue({
          municipio: null,
          estado: null,
          pais: ''
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
    cp: [null as string | null, [Validators.pattern(/^[a-zA-Z0-9]+$/)]], 
    pais: ['', Validators.required],
    estado: [null as number | null, [Validators.minLength(2), Validators.maxLength(10)]],
    municipio: [null as number | null, [Validators.minLength(2), Validators.maxLength(50)]],
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
      this.formVisitante.markAllAsTouched();
      if (!this.isGroup.value && this.formVisitante.errors?.['alMenosUno']) {
        this.unVisitante.markAsTouched();
      }
      return;
    }

    const invitadoData = this.invitado.hasValue() ? this.invitado.value()?.data : null;

    const visitanteData = this.formVisitante.value;

    const visitantesPayload: Visitante = {
      nombre: visitanteData.nombre!,
      edad: visitanteData.edad!,
      pais: visitanteData.pais!,
      cp: visitanteData?.cp ?? null,
      estadoId: visitanteData.estado ?? null,
      municipioId: visitanteData.municipio ?? null,
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

    // si venimos del flujo de eventos guardamos el visitante independientemente
    // en lugar de usar queryParams, leemos la señal `registroFlow` del servicio
    const flow = this.registrarEventoService.registroFlow();
    if (flow === 'evento') {
      this.registrarEventoService.setVisitanteRegistrado(visitantesPayload);
      this.registrarEventoService.markVisitorRegistered();
      // limpiar la señal para no afectar registros futuros
      this.registrarEventoService.clearRegistroFlow();
    }

    // Limpiar el formulario antes de navegar
      this.formVisitante.reset();
      this.isGroup.reset(false);
      this.dipomexService.setCp(null);

      if (this.router.url.includes('operador/boletos/registro')) {
        this.router.navigate(['/operador/boletos/venta']);
        return;
      }

      // if we arrived here from the agenda child route, go back to the agenda
      if (this.router.url.includes('agendar/registro')) {
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        return;
      }

      // this.router.navigate([`/operador/${this.nextRoute()}`]);
  }

  get formularioValido(): boolean {
    return this.formVisitante.valid;
  }

  get nombre() {
    return this.formVisitante.get('nombre');
  }

  get edad() {
    return this.formVisitante.get('edad');
  }

  get pais() {
    return this.formVisitante.get('pais');
  }

  get estado() {
    return this.formVisitante.get('estado');
  }

  get municipio() {
    return this.formVisitante.get('municipio');
  }

  get cp() {
    return this.formVisitante.get('cp');
  }

  get cantidadHombres() {
    return this.formVisitante.get('cantidadHombres');
  }

  get cantidadMujeres() {
    return this.formVisitante.get('cantidadMujeres');
  }
  
  get cantidadOtros() {
    return this.formVisitante.get('cantidadOtros');
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
    // this.invitadoService.getInvitadoById(codigo, museoId!);
    this.invitadoService.getInvitacion(codigo);
    this.codigoInvitacion.reset();
  }

  private esPaisMexico(pais: string | null | undefined): boolean {
    if (!pais) {
      return false;
    }

    const paisNormalizado = pais
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return paisNormalizado === 'mexico';
  }

}