import { afterNextRender, ChangeDetectionStrategy, Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule} from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { VisitantesService } from '../../../services/visitantes/visitantes.service';
import { Visitante } from '../../../interfaces/visitante.interface';
import { DipomexService } from '../../../services/dipomex/dipomex.service';
import { initFlowbite } from 'flowbite';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificacionCortesia } from '../notificacion-cortesia/notificacion-cortesia';
import { InvitadosPendientesService } from '../../../services/invitados/invitados-pendientes.service';


@Component({
  selector: 'app-formulario-registro-visitente',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NotificacionCortesia],
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

  protected isGroup = new FormControl<Boolean>(false);
  protected unVisitante = new FormControl<string>('');
  private nextRoute = signal<string>('');

  protected visitanteCreated = this.visitantesService.visitanteCreated;
  protected invitado = signal<{id: number, nombre: string} | null>(null);
  protected user = this.authService.user;
  protected estados = this.dipomexService.estados;
  protected cpInfo = this.dipomexService.cpInfo;
  protected cortesiaActiva = signal<boolean>(false);

  constructor() {
    afterNextRender(() => initFlowbite());
    // Limpiar el signal al inicializar el componente
    // this.visitantesService.clearVisitanteCreated();

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
    })
    
    effect(() => {
      const visitante = this.visitanteCreated();
      if (!visitante) {
        return;
      }

      this.visitantesService.clearVisitanteCreated();

      // Limpiar el formulario antes de navegar
      this.formVisitante.reset();
      this.isGroup.reset(false);
      this.dipomexService.cp.set('');

      const queryParams: {
        visitanteId: number;
        totalVisitantes: number;
        invitadoId?: number;
      } = {
        visitanteId: visitante.id!,
        totalVisitantes: visitante.totalVisitantes!,
      };

      const invitadoId = this.invitado()?.id;
      if (invitadoId) {
        queryParams.invitadoId = invitadoId;
      }

      this.router.navigate([`/operador/${this.nextRoute()}`], { queryParams });
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
      const invitadoNombre = this.invitado()?.nombre;
      if (invitadoNombre) {
        this.cortesiaActiva.set(true);
        this.formVisitante.patchValue({
          nombre: invitadoNombre,
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

  onInvitadoId(invitado: {id: number, nombre: string}): void {
    // Aquí puedes manejar el invitadoId recibido desde el componente hijo
    this.invitado.set(invitado);
  }

  onLimpiarCortesia(): void {
    this.invitado.set(null);
    this.cortesiaActiva.set(false);
  }
}