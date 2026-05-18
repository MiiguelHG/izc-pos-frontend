import { Component, inject, OnInit, effect, input, output, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ReservaEvento } from '../../../interfaces/registrar-evento.interface';
import { CustomValidators } from '../../../validators/custom.validators';
import { FormaPagoService } from '../../../services/formaPago/forma-pago.service';
import { fechaReservaValidator } from '../../../directives/fechaReservaValidator.directive';
import { horarioReservaValidator } from '../../../directives/horarioReservaValidator.directive';

@Component({
  selector: 'app-actualizar-evento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './actualizar-evento.html',
  styleUrl: './actualizar-evento.css',
})
export class ActualizarEvento implements OnInit {

  private registrarEventoService = inject(RegistrarEventoService);
  private formaPagoService = inject(FormaPagoService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  eventoId = input<number>(0);
  museoId = input.required<number>();
  cerrado = output<void>();

  exito = false;

  servicios = this.registrarEventoService.articuloCreado;
  formasPago = this.formaPagoService.formasPago;

  rolId = computed(() => this.authService.user()?.rol?.id ?? null);
  usuarioId = this.authService.user()!.id;
  capacidad!: number;


  totalCalculado = 0;

  private eventoOriginal!: ReservaEvento;

  constructor() {

    effect(() => {
      const eventoActualizado = this.registrarEventoService.eventosActualizadosSignal();

      if (eventoActualizado){
        this.cerrarModal();
      }
    });

    effect(() => {
      const serviciosList = this.servicios();
      const articuloId = this.eventoForm.get('articuloId')?.value ?? null;
      this.actualizarTotalPorArticulo(articuloId, serviciosList);
    });

    effect(() => {
      const id = this.eventoId();
      if (!id) return;

      const lista = this.registrarEventoService.fechaRango();

      const evento = lista.find(e => e.id === id);

      if (evento) {
        this.cargarDatosFromEvento(evento);
      }
    });

  }

   eventoForm = new FormGroup({
    nombreEvento: new FormControl('', [Validators.required, Validators.minLength(3)]),
    responsable: new FormControl('', [Validators.required, Validators.minLength(3)]),
    contactoResponsable: new FormControl('', [Validators.required, CustomValidators.telefono]),
    
    articuloId: new FormControl< number | null>(null, [Validators.required]),

    fecha_inicio: new FormControl('', [Validators.required, fechaReservaValidator()]),

    hora_inicio: new FormControl('', [Validators.required, horarioReservaValidator('10:00', '22:00')]),
    hora_fin: new FormControl('', [Validators.required, horarioReservaValidator('10:00', '22:00')]),

    estado: new FormControl<'reservado' | 'cancelado' | 'asistido'>('reservado', [Validators.required]),
    formaPagoId: new FormControl< number | null>(null, [Validators.required]),

    total: new FormControl<number>({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    this.registrarEventoService.clearEventosActualizados();

    this.eventoForm.get('articuloId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(articuloId => {
        this.actualizarTotalPorArticulo(articuloId ?? null);
      });
    
    this.registrarEventoService.cargarServiciosPorMuseo(this.museoId()!);
  }

  private actualizarTotalPorArticulo(articuloId: number | null, serviciosList = this.servicios()) {
    if (!articuloId || serviciosList.length === 0) return;

    const servicio = serviciosList.find(serv => serv.id === Number(articuloId));
    if (!servicio) return;

    this.totalCalculado = servicio.precioEstandar;
    this.eventoForm.patchValue({ total: servicio.precioEstandar }, { emitEvent: false });
  }

  cargarDatosFromEvento(evento: ReservaEvento) {

    this.eventoOriginal = evento;

    this.eventoForm.patchValue({
      nombreEvento: evento.nombreEvento,
      responsable: evento.responsable,
      contactoResponsable: evento.contactoResponsable,
      articuloId: evento.articuloId,
      formaPagoId: evento.formaPagoId,
      estado: evento.estado,

      fecha_inicio: this.toLocalDateInput(evento.fechaInicio),
      hora_inicio: this.toLocalTimeInput(evento.fechaInicio),
      hora_fin: this.toLocalTimeInput(evento.fechaFin),

      total: evento.total,
    });

    this.totalCalculado = evento.total;
  }

  actualizarEvento() {
    if (this.eventoForm.invalid || !this.eventoOriginal) return;

    const formValues = this.eventoForm.getRawValue();

    const payload: Partial<ReservaEvento> = {
      ...this.eventoOriginal,

      nombreEvento: formValues.nombreEvento!,
      responsable: formValues.responsable!,
      contactoResponsable: formValues.contactoResponsable!,

      fechaInicio: `${formValues.fecha_inicio}T${formValues.hora_inicio}:00`,
      fechaFin: `${formValues.fecha_inicio}T${formValues.hora_fin}:00`,

      estado: formValues.estado!,
      articuloId: formValues.articuloId!,
      formaPagoId: formValues.formaPagoId!,

      total: this.totalCalculado,
    };

    this.registrarEventoService.actualizarEventos(this.eventoId(), payload);
  }

  cerrarModal() {
    this.cerrado.emit();
  }

  private toLocalDateInput(iso: string): string {
    const d = new Date(iso);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toLocalTimeInput(iso: string): string {
    const d = new Date(iso);

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  get nombreEvento() { return this.eventoForm.get('nombreEvento'); }
  get responsable() { return this.eventoForm.get('responsable'); }
  get contactoResponsable() { return this.eventoForm.get('contactoResponsable'); }
  get articuloId() { return this.eventoForm.get('articuloId'); }
  get fecha_inicio() { return this.eventoForm.get('fecha_inicio'); }
  get hora_inicio() { return this.eventoForm.get('hora_inicio'); }
  get hora_fin() { return this.eventoForm.get('hora_fin'); }
  get formaPagoId() { return this.eventoForm.get('formaPagoId'); }

}
