import { Component, inject, OnInit, effect, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from "@angular/router";
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ReservaEvento } from '../../../interfaces/registrar-evento.interface';

@Component({
  selector: 'app-actualizar-evento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './actualizar-evento.html',
  styleUrl: './actualizar-evento.css',
})
export class ActualizarEvento implements OnInit {

  private registrarEventoService = inject(RegistrarEventoService);
  private authService = inject(AuthService)

  @Input() eventoId!: number;
  @Output() cerrado = new EventEmitter<void>();

  message = '';
  exito = false;

  servicios = this.registrarEventoService.articuloCreado;
  formasPago = this.registrarEventoService.formaPagoCreada;

  visitanteId: number | null = null;
  museoId: number | null = null;
  usuarioId: number | null = null;
  capacidad!: number;

  totalCalculado = 0;

  private eventoOriginal!: ReservaEvento;

  constructor() {

    effect(() => {
      const eventoActualizado = this.registrarEventoService.eventosActualizadosSignal();
      const mensaje = this.registrarEventoService.mensajeCreado();

      if (mensaje) {
        this.message = mensaje;
        this.exito = !!eventoActualizado;

        if (eventoActualizado){
          setTimeout(() => {
            this.cerrado.emit();
          }, 800);
        }
      }
    });

    effect(() => {
      const articuloId = this.eventoForm.get('articuloId')?.value;
      const serviciosList = this.servicios();

      if (articuloId && serviciosList.length > 0) {
        const s = serviciosList.find(serv => serv.id === Number(articuloId));
        if (s){
          this.totalCalculado = s.precioEstandar;
          this.eventoForm.patchValue({ total: s.precioEstandar }, {emitEvent: false});
        }
      }
    });

    effect(() => {
      if (!this.eventoId) return;

      const lista = this.registrarEventoService.fechaRango();

      const evento = lista.find(e => e.id === this.eventoId);

      if (evento) {
        this.cargarDatosFromEvento(evento);
      }
    });

  }

   eventoForm = new FormGroup({
    nombreEvento: new FormControl('', [Validators.required, Validators.minLength(3)]),
    responsable: new FormControl('', [Validators.required, Validators.minLength(3)]),
    contactoResponsable: new FormControl('', [Validators.required]),
    
    articuloId: new FormControl< number | null>(null, [Validators.required]),

    fecha_inicio: new FormControl('', [Validators.required]),
    fecha_fin: new FormControl('', [Validators.required]),

    hora_inicio: new FormControl('', [Validators.required]),
    hora_fin: new FormControl('', [Validators.required]),

    estado: new FormControl<'reservado' | 'cancelado' | 'asistido'>('reservado', [Validators.required]),
    formaPagoId: new FormControl< number | null>(null, [Validators.required]),

    total: new FormControl<number>({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    const user = this.authService.user();

    this.museoId = user!.museoId ?? null;
    this.usuarioId = user!.id ?? null;
    
    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();
    
    this.registrarEventoService.cargarServiciosPorMuseo(this.museoId!);
    this.registrarEventoService.cargarFormasPago();
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
      fecha_fin: this.toLocalDateInput(evento.fechaFin),
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
      ...this.eventoOriginal, // 👈 conserva IDs

      nombreEvento: formValues.nombreEvento!,
      responsable: formValues.responsable!,
      contactoResponsable: formValues.contactoResponsable!,

      fechaInicio: `${formValues.fecha_inicio}T${formValues.hora_inicio}:00`,
      fechaFin: `${formValues.fecha_fin}T${formValues.hora_fin}:00`,

      estado: formValues.estado!,
      articuloId: formValues.articuloId!,
      formaPagoId: formValues.formaPagoId!,

      total: this.totalCalculado,
    };

    console.log('PAYLOAD UPDATE =>', payload);

    this.registrarEventoService.actualizarEventos(this.eventoId, payload);
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

}
