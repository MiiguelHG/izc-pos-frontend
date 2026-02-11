import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { BoletosService } from '../../../../services/boletos/boletos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { BoletosCarrito } from '../../../../interfaces/boletos-carrito.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { EmitirBoleto } from '../../../../interfaces/emitir-boleto.interface';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, Location } from '@angular/common';
import { Printing } from '../../../../services/esc-pos/printing';
import { VisitantesService } from '../../../../services/visitantes/visitantes.service';
import { DatosTicket } from '../../../../interfaces/datos-ticket.interface';
import { ConfiguracionQRService, NivelCorreccionQR } from '../../../../services/nivel-de-error-QR/configuracion-qr.service';
import { InvitadosPendientesService } from '../../../../services/invitados/invitados-pendientes.service';

@Component({
  selector: 'app-boletos-venta',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './boletos-venta.html',
  styleUrl: './boletos-venta.css',
})
export class BoletosVenta {
  private boletosService = inject(BoletosService);
  private boletoEmitidoService = inject(BoletoEmitidoService);
  private formaPagoService = inject(FormaPagoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  private formBuilder = inject(FormBuilder);
  private printingService = inject(Printing);
  private visitantesService = inject(VisitantesService);
  private invitadoService = inject(InvitadosPendientesService);
  private ConfiguracionQR = inject(ConfiguracionQRService)

  protected boletosTipos = this.boletosService.boletosTiposOperador;
  protected formasPago = this.formaPagoService.formasPago;
  protected user = this.authService.user;
  protected currentBoletoEmitido = this.boletoEmitidoService.currentBoletoEmitido;
  protected visitanteCreated = this.visitantesService.visitanteCreated;

  readonly carritoBoletos = signal<BoletosCarrito[]>([]);
  protected datosParaTicket = signal<DatosTicket | null>(null);

  protected visitanteId = signal<number | null>(null);
  protected totalVisitantes = signal<number | null>(null);

  protected estaEnCarrito = computed(() => {
    const carrito = this.carritoBoletos();
    return (boletoTipoId: number) => carrito.some(boleto => boleto.id === boletoTipoId);
  })

  protected totalMonto = computed(() => {
    return this.carritoBoletos().reduce((total, boleto) => total + (boleto.precioFinal * boleto.cantidad), 0);
  });

  protected totalCantidadBoletos = computed(() => {
    return this.carritoBoletos().reduce((total, boleto) => total + boleto.cantidad, 0);
  });

  protected limiteAlcanzado = computed(() => {
    const total = this.totalVisitantes();
    return total !== null && this.totalCantidadBoletos() >= total;
  });

  protected formaPago = new FormControl(null, [Validators.required]);

  protected nivelErrorQR = this.ConfiguracionQR.nivelError

  FormIngreso = this.formBuilder.group({
    nivelError: ['M'],
  });

  constructor() {
    afterNextRender(() => {
      initFlowbite();
    });

    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const visitanteId = params['visitanteId'] ? +params['visitanteId'] : null;
        this.visitanteId.set(visitanteId);

        const totalVisitantes = params['totalVisitantes'] ? +params['totalVisitantes'] : null;
        this.totalVisitantes.set(totalVisitantes);
        // Si se proporciona un invitadoId en los parámetros, se asume que es una venta especial para un invitado específico
        const invitadoId = params['invitadoId'] ? +params['invitadoId'] : null;
        this.boletosService.esEspecial.set(invitadoId ? 'true' : 'false');
        if (invitadoId) {
          this.invitadoService.getInvitadoById(invitadoId);
          // this.boletosService.esEspecial.set('true');
        } else {
          this.invitadoService.clearInvitado();
          // this.boletosService.esEspecial.set('false');
        }
      });

    effect(() => {
      const invitadoResponse = this.invitadoService.invitado();
      const invitado = invitadoResponse?.data;
      if (!invitado) {
        return;
      }

      if (invitado.usado) {
        this.invitadoService.clearInvitado();
        this.boletosService.esEspecial.set('false');
        alert('La invitacion ya fue usada.');
        this.location.back();
      }
    });

    effect(() => {
      if (this.currentBoletoEmitido()) {
        // Aqui se puede implementar la logica para enviar la info a imprimir

        //Datos para el ticket
        const datosTicket = this.datosParaTicket();
        if (datosTicket) {
          console.log('Ticket enviado a impresión', { datosTicket });
          this.imprimirTicket(datosTicket);
          //this.verVistaPrevia();
        }

        // Actualizar el estado del la cortesia si es necesario
        const currentInvitado = this.invitadoService.invitado();

        if (currentInvitado && currentInvitado.data?.usado === false) {
          this.invitadoService.marcarComoUsado(currentInvitado?.data?.id!, this.currentBoletoEmitido()?.id! );
          this.invitadoService.clearInvitado();
        }

        // Despues se limia el boleto emitido actual
        this.boletoEmitidoService.clearCurrentBoletoEmitido();
        this.carritoBoletos.set([]);
        this.formaPago.reset();
        // Y se navega a otra ruta
        this.router.navigate(['/operador/boletos-vendidos']);
      }
    })
  }

  agregarAlCarrito(boletoTipo: BoletoTipo) {
    if (this.limiteAlcanzado() || !boletoTipo.id || boletoTipo.precioFinal === undefined) {
      return; // No agregar si ya se alcanzó el límite
    }
    this.carritoBoletos.update((carrito) => [
      ...carrito,
      { ...boletoTipo, cantidad: 1 } as BoletosCarrito,
    ]);
  }

  eliminarDelCarrito(boletoTipoId: number): void {
    this.carritoBoletos.update((carrito) => {
      return carrito.filter(boleto => boleto.id !== boletoTipoId);
    })
  }

  incrementarCantidad(boletoTipoId: number): void {
    if (this.limiteAlcanzado()) {
      return; // No incrementar si ya se alcanzó el límite
    }
    this.carritoBoletos.update((carrito) => {
      return carrito.map((boleto) => {
        if (boleto.id === boletoTipoId) {
          return { ...boleto, cantidad: boleto.cantidad + 1 };
        }
        return boleto;
      });
    });
  }

  decrementarCantidad(boletoTipoId: number): void {
    this.carritoBoletos.update((carrito) => {
      return carrito.map((boleto) => {
        if (boleto.id === boletoTipoId && boleto.cantidad > 1) {
          return { ...boleto, cantidad: boleto.cantidad - 1 };
        }
        return boleto;
      });
    });
  }

  emitirVenta(): void {
    const boletosSeleccionados = this.carritoBoletos().map((boleto) => {
      return `${boleto.nombre} x ${boleto.cantidad} - $${boleto.precioFinal.toFixed(2)}`;
    });
    console.log('Boletos seleccionados:', boletosSeleccionados);
    console.log('Total a pagar:', this.totalMonto());

    const visitante = this.visitanteCreated();
    if (!visitante && !this.visitanteId()) {
      console.error('No se ha creado un visitante.');
      return;
    }
    const nivelSeleccionado = this.FormIngreso.controls.nivelError.value;
    if (nivelSeleccionado) {
      this.ConfiguracionQR.setactualizarNivelErrorQR(nivelSeleccionado as NivelCorreccionQR);
    }

    //Obener los datos para el ticket
    const datosTicket: DatosTicket = {
      museoUsuario: this.user()?.museo?.nombre || 'Museo',
      museoUbicacion: this.user()?.museo?.ubicacion || 'Ubicación',
      nombreVisitante: visitante?.nombre || 'Visitante',
      totalVisitantes: visitante?.totalVisitantes || this.totalVisitantes() || 0,
      boletos: this.carritoBoletos().map(boleto => ({
        nombre: boleto.nombre,
        cantidad: boleto.cantidad,
        precio: boleto.precioFinal,
        subtotal: boleto.precioFinal * boleto.cantidad
      })),
      total: this.totalMonto(),
      fecha: new Date(),
      usuarioNombre: this.user()?.nombre || 'Operador',

    };
    this.datosParaTicket.set(datosTicket);

    // Lógica para emitir la venta de boletos
    const payload: EmitirBoleto = {
      total: this.totalMonto(),
      carritoBoletos: this.carritoBoletos().map((boleto) => {
        return {
          boletoTipoId: boleto.id,
          cantidad: boleto.cantidad
        }
      }),
      usuarioId: this.user()?.id ?? 0,
      museoId: this.user()?.museoId ?? 0,
      visitanteId: this.visitanteId() ?? 0,
      formaPagoId: this.formaPago.valid ? this.formaPago.value ?? 0 : 0
    };

    this.boletoEmitidoService.emitirBoletoVenta(payload);
    console.log('Datos del ticket:', datosTicket);
    //Obener el nivel de error QR
    console.log('Nivel de error QR:', this.ConfiguracionQR.getDescripcionNivelErrorQR());
  }

  private imprimirTicket(datos: DatosTicket): void {
    console.log('\nEnviando ticket a impresión...');
    this.printingService.imprimirTicket(datos);
  }

  verVistaPrevia(): void {
    const datosTicket = this.datosParaTicket();
    if (datosTicket) {
      this.printingService.vistaPrevia(datosTicket);
    }
  }
}