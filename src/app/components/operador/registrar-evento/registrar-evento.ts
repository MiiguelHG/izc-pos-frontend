import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, effect, afterNextRender, computed, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { AuthService } from '../../../services/auth/auth.service';
import { initFlowbite, Modal } from 'flowbite';
import { CustomValidators } from '../../../validators/custom.validators';
import { FormaPagoService } from '../../../services/formaPago/forma-pago.service';
import { CurrentVentaBoletoService } from '../../../services/currentVentaBoleto/current-venta-boleto.service';

// Modificar el componente y el service para adaptarlo al nuevo repositorio del backend.
@Component({
  selector: 'app-registrar-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-evento.html',
  styleUrl: './registrar-evento.css',
})
export class RegistrarEventoOperador implements OnInit {
  // Injección de servicios necesarios
  private registrarEventoService = inject(RegistrarEventoService);
  private formaPagoService = inject(FormaPagoService);
  private authService = inject(AuthService);
  private currentVentaBoletoService = inject(CurrentVentaBoletoService);
  private router = inject(Router);

  usuarioId = computed(() => this.authService.user()?.id ?? null);
  rolNombre = computed(() => this.authService.user()?.rol?.nombre);

  museoId = input.required<number>();

  message = '';
  exito = false;

  // Listas para servicios y formas de pago
  servicios = this.registrarEventoService.articuloCreado;
  formasPago = this.formaPagoService.formasPago;

  totalCalculado: number = 0;
  
  capacidad = computed(() => {
    const h = this.eventoForm.get('cantidadHombres')?.value ?? 0;
    const m = this.eventoForm.get('cantidadMujeres')?.value ?? 0;
    const o = this.eventoForm.get('cantidadOtros')?.value ?? 0;
    return Number(h) + Number(m) + Number(o);
  });

  constructor() {
    afterNextRender(() => initFlowbite());

    effect(() => {
      const museo = this.museoId();
      if (!museo) return;

      this.registrarEventoService.cargarServiciosPorMuseo(museo);
    });

    // Efecto para manejar cambios en el evento creado
    effect(() => {
      const evento = this.registrarEventoService.eventoCreado();
      const mensaje = this.registrarEventoService.mensajeCreado();

      if (mensaje) {
        this.message = mensaje;
        this.exito = !!evento;

        if(evento){
          this.eventoForm.reset();
          this.registrarEventoService.clearEventoCreado();
          // Limpiar datos del visitante registrado al finalizar el flujo de registro de evento 
          this.registrarEventoService.clearVisitanteRegistrado();
          this.registrarEventoService.clearVisitorRegistration();
        }
      }
    });

    // Efecto para cargar datos del visitante registrado (flujo de eventos independiente)
    effect(() => {
      const visitante = this.registrarEventoService.visitanteRegistrado();
      if (visitante) {
        this.eventoForm.patchValue({
          nombre: visitante.nombre,
          edad: visitante.edad,
          cp: visitante.cp != null ? visitante.cp.toString() : '',                                                                                                                           
          pais: visitante.pais,
          estadoId: visitante.estadoId ?? null,
          municipioId: visitante.municipioId ?? null,
          cantidadHombres: visitante.cantidadHombres,
          cantidadMujeres: visitante.cantidadMujeres,
          cantidadOtros: visitante.cantidadOtros
        }, { emitEvent: false });
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
    // El contacto debe ser un número celular de 10 dígitos (sin espacios)
    contactoResponsable: new FormControl('', [Validators.required, CustomValidators.telefono]),
    
    articuloId: new FormControl< number | null>(null, [Validators.required]),

    fecha_inicio: new FormControl('', [Validators.required]),

    hora_inicio: new FormControl('', [Validators.required]),
    hora_fin: new FormControl('', [Validators.required]),

    estado: new FormControl<'reservado' | 'cancelado' | 'asistido'>('reservado', [Validators.required]),
    formaPagoId: new FormControl< number | null>(null, [Validators.required]),

    total: new FormControl<number>({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
  
    // **campos del visitante**
    nombre: new FormControl('', [Validators.required]),
    edad: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    cp: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
    estadoId: new FormControl(null as number | null, [Validators.minLength(2), Validators.maxLength(10)]),
    municipioId: new FormControl(null as number | null, [Validators.minLength(2), Validators.maxLength(50)]),
    cantidadHombres: new FormControl<number | null>(null, [Validators.min(0)]),
    cantidadMujeres: new FormControl<number | null>(null, [Validators.min(0)]),
    cantidadOtros: new FormControl<number | null>(null, [Validators.min(0)])
  });

  ngOnInit() {
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

      this.totalCalculado = 0;
      this.eventoForm.patchValue({ total: 0 }, { emitEvent: false });
    });
  }

  obtenerPrimerCampoInvalido(form: FormGroup): string | null {
    for (const campo in form.controls) {
      if (form.controls[campo].invalid) {
        return campo;
      }
    }
    return null;
  }

  registrarEventoOperador() {

    const campoInvalido = this.obtenerPrimerCampoInvalido(this.eventoForm);

    if (this.eventoForm.invalid || this.museoId() === null || this.usuarioId() === null) {
      this.message = 'Por favor, completa todos los campos requeridos. El campo "' + (campoInvalido ?? '') + '" es inválido o falta información de usuario.';
      return;
    }

    const form = this.eventoForm.getRawValue();
    const capacidad = (form.cantidadHombres ?? 0) + (form.cantidadMujeres ?? 0) + (form.cantidadOtros ?? 0);

    if (capacidad === 0) {
      this.message = 'La cantidad de asistentes debe ser mayor a 0.';
      return;
    }

    const fechaInicio = `${form.fecha_inicio}T${form.hora_inicio}:00`; 
    const fechaFin = `${form.fecha_inicio}T${form.hora_fin}:00`;

    const payload = {
      nombreEvento: form.nombreEvento!,
      responsable: form.responsable!,
      contactoResponsable: form.contactoResponsable!,
      capacidad: capacidad,
      fechaInicio,
      fechaFin: fechaFin, // para simplificar el backend, se puede usar la misma fecha de inicio y fin
      total: Number(form.total!),
      estado: form.estado!,
      articuloId: form.articuloId!,
      formaPagoId: form.formaPagoId!,

      // datos del visitante
      nombre: form.nombre!,
      edad: Number(form.edad!),
      cp: form.cp!,
      pais: form.pais!,
      estadoId: form.estadoId!,
      municipioId: form.municipioId!,
      cantidadHombres: Number(form.cantidadHombres!),
      cantidadMujeres: Number(form.cantidadMujeres!),
      cantidadOtros: Number(form.cantidadOtros!),

      usuarioId: this.usuarioId()!,
      museoId: this.museoId()!
    };

    this.registrarEventoService.registrarEvento(payload);

    this.currentVentaBoletoService.clearState();

    const $el = document.getElementById('registerEventoButtonModal');
    if ($el) {
      new Modal($el, {}, { id: 'registerEventoButtonModal', override: true }).hide();
    }
  }

  cerrarModal() {
    this.message = '';
    this.exito = false;
    this.registrarEventoService.clearEventoCreado();
    this.registrarEventoService.clearVisitanteRegistrado();
    this.registrarEventoService.clearVisitorRegistration();
  }

  protected goToRegistroVisitante(): void {
    if (this.registrarEventoService.visitorRegistered()) {
      // visitor already registered for this flow, open reservation modal directly
      setTimeout(() => {
        const btn = document.querySelector('[data-modal-target="registerEventoButtonModal"]') as HTMLElement | null;
        btn?.click();
      });
      return;
    }

    // otherwise start the visitor registration flow (use service signal instead of queryParams)
    this.registrarEventoService.setRegistroFlow('evento');

    if(this.rolNombre() === 'operador'){
      this.router.navigate(['/operador/agendar/registro']);
      return;
    } else{
      this.router.navigate(['/admin/agendar/registro']);
      return;
    }
  }
}
 