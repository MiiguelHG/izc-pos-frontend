import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, effect } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from "@angular/router";
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-registrar-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registrar-evento.html',
  styleUrl: './registrar-evento.css',
})
export class RegistrarEventoOperador implements OnInit {
  // Injección de servicios necesarios
  private registrarEventoService = inject(RegistrarEventoService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  message = '';
  mostrarFormulario = false;
  exito = false;

  // Listas para servicios y formas de pago
  servicios = this.registrarEventoService.articuloCreado;
  formasPago = this.registrarEventoService.formaPagoCreada;

  // Inicialización de las variable de ID
  visitanteId: number | null = null;
  museoId: number | null = null;
  usuarioId: number | null = null;

  capacidad: number | null = null;
  totalCalculado: number = 0;

  constructor() {
    // Efecto para manejar cambios en el evento creado
    effect(() => {
      const evento = this.registrarEventoService.eventoCreado();
      const mensaje = this.registrarEventoService.mensajeCreado();

      if (mensaje) {
        this.message = mensaje;
        this.exito = !!evento;

        if(evento){
          this.eventoForm.reset();
          //this.visitanteId = null;
          this.mostrarFormulario = false;
          this.registrarEventoService.clearEventoCreado();
        }
      }
    });

    // Efecto para calcular el total cuando cambian los servicios cargados
    effect(() => {
      const articuloId = this.eventoForm.get('articuloId')?.value;
      const serviciosList = this.servicios();

      const idNum = Number(articuloId);
      if (!Number.isNaN(idNum) && serviciosList && serviciosList.length > 0) {
        const servicioSeleccionado = serviciosList.find(s => s.id === idNum);
        if (servicioSeleccionado) {
          this.totalCalculado = servicioSeleccionado.precioEstandar;
          this.eventoForm.patchValue({ total: this.totalCalculado }, { emitEvent: false });
        }
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
    this.museoId = user?.museoId ?? null;
    this.usuarioId = user?.id ?? null;

    // Cargar servicios y formas de pago al inicializar el componente
    this.registrarEventoService.cargarServiciosPorMuseo(this.museoId!);
    this.registrarEventoService.cargarFormasPago();

    // Si viene con queryParam 'visitante_registrado', mostrar el formulario
    this.route.queryParams.subscribe(params => {
      if (params['visitante_registrado'] === 'true') {
        this.mostrarFormulario = true;
      }

      if (params['visitanteId']) {
        this.visitanteId = +params['visitanteId'];
      }

      if (params['totalVisitantes']) {
        this.capacidad = +params['totalVisitantes'];
      }
    });

    // Suscribirse a cambios en articuloId para calcular el total cuando el usuario seleccione
    this.eventoForm.get('articuloId')?.valueChanges.subscribe((val) => {
      const idNum = Number(val);
      const serviciosList = this.servicios();
      if (!Number.isNaN(idNum) && serviciosList && serviciosList.length > 0) {
        const servicioSeleccionado = serviciosList.find(s => s.id === idNum);
        if (servicioSeleccionado) {
          this.totalCalculado = servicioSeleccionado.precioEstandar;
          this.eventoForm.patchValue({ total: this.totalCalculado }, { emitEvent: false });
          return;
        }
      }
      // si no hay servicio seleccionado
      this.totalCalculado = 0;
      this.eventoForm.patchValue({ total: 0 }, { emitEvent: false });
    });
  }

  registrarEventoOperador() {
    if (this.eventoForm.invalid || this.visitanteId === null || this.museoId === null || this.usuarioId === null) {
      this.message = 'Por favor, completa todos los campos requeridos.';
      console.log(this.visitanteId)
      console.log(this.museoId)
      console.log(this.usuarioId)
      return;
    }

    const form = this.eventoForm.getRawValue();

    const fechaInicio = `${form.fecha_inicio}T${form.hora_inicio}:00`; 
    const fechaFin = `${form.fecha_fin}T${form.hora_fin}:00`;

    const payload = {
      nombreEvento: form.nombreEvento!,
      responsable: form.responsable!,
      contactoResponsable: form.contactoResponsable!,
      capacidad: Number(this.capacidad!),

      fechaInicio,
      fechaFin,

      total: Number(form.total!),
      estado: form.estado!,


      articuloId: form.articuloId!,
      formaPagoId: form.formaPagoId!,

      visitanteId: this.visitanteId!,
      usuarioId: this.usuarioId!,
      museoId: this.museoId!,
    };

    console.log('PAYLOAD FINAL >>>', payload);
    this.registrarEventoService.registrarEvento(payload);
  }

  cerrarModal() {
    this.message = '';
    this.exito = false;
    this.registrarEventoService.clearEventoCreado();
  }
}
 