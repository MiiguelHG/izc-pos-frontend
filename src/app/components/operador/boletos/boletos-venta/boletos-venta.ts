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
import { DecimalPipe, Location } from '@angular/common';
import { Printing } from '../../../../services/esc-pos/printing';
import { ConfiguracionQRService, NivelCorreccionQR } from '../../../../services/nivel-de-error-QR/configuracion-qr.service';
import { InvitadosPendientesService } from '../../../../services/invitados/invitados-pendientes.service';
import { CurrentVentaBoletoService } from '../../../../services/currentVentaBoleto/current-venta-boleto.service';
import { BoletoEmitidoInfo } from '../../../../interfaces/boleto-emitido-info.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Paginacion } from "../../../paginacion/paginacion";

@Component({
  selector: 'app-boletos-venta',
  imports: [ReactiveFormsModule, DecimalPipe, Paginacion],
  templateUrl: './boletos-venta.html',
  providers: [InvitadosPendientesService, BoletosService],
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
  private invitadoService = inject(InvitadosPendientesService);
  private ConfiguracionQR = inject(ConfiguracionQRService)
  private currentVentaBoletoService = inject(CurrentVentaBoletoService);

  protected boletosTipos = this.boletosService.boletosTipos;
  protected formasPago = this.formaPagoService.formasPago;
  protected user = this.authService.user;
  protected currentBoletoEmitido = this.boletoEmitidoService.currentBoletoEmitido;
  protected invitado = this.invitadoService.invitado;

  readonly carritoBoletos = signal<BoletosCarrito[]>([]);

  protected totalVisitantes = computed(() => {
    const currentVenta = this.currentVentaBoletoService.state().visitante?.totalVisitantes;
    return currentVenta ?? 0;
  });

  
  protected totalMonto = computed(() => {
    return this.carritoBoletos().reduce((total, boleto) => total + (boleto.precioFinal * boleto.cantidad), 0);
  });
  
  protected totalCantidadBoletos = computed(() => {
    return this.carritoBoletos().reduce((total, boleto) => total + boleto.cantidad, 0);
  });

  protected estaEnCarrito = computed(() => {
    const carrito = this.carritoBoletos();
    return (boletoTipoId: number) => carrito.some(boleto => boleto.id === boletoTipoId);
  });

  protected limiteAlcanzado = computed(() => {
    const total = this.totalVisitantes();
    return total !== null && this.totalCantidadBoletos() >= total;
  });

  protected formaPago = new FormControl(null as number | null, [Validators.required]);

  protected nivelErrorQR = this.ConfiguracionQR.nivelError

  FormIngreso = this.formBuilder.group({
    nivelError: ['M'],
  });

  protected errorInvitado = computed(() => {
    const error = this.invitado.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al emitir el boleto';
    return null;
  });

  protected errorBoletosTipos = computed(() => {
    const error = this.boletosTipos.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los tipos de boletos';
    return null;
  });

  protected errorBoletoEmitido = this.boletoEmitidoService.errorBoletoEmitido;

  constructor() {

    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? +params['page'] : 1;
      this.boletosService.setPage(page);
    });

    effect(() => {
      const invitadoId = this.currentVentaBoletoService.state().invitadoId;

      if (!invitadoId) {
        this.boletosService.esEspecial.set('false');
        return;
      }

      this.invitadoService.getInvitacion(invitadoId); 


      const invitadoResponse = this.invitado.hasValue() ? this.invitado.value() : null;
      const invitado = invitadoResponse?.data;
      if (!invitado) {
        return;
      }

      if (this.errorInvitado()) {
        this.invitadoService.clearInvitado();
        this.boletosService.esEspecial.set('false');
        alert(this.errorInvitado());
        this.location.back();
        return;
      }

      this.boletosService.esEspecial.set('true');
    });

    effect(() => {
      if (this.currentBoletoEmitido()) {
        // Aqui se puede implementar la logica para enviar la info a imprimir

        const datosTicket = this.currentBoletoEmitido()
        //Datos para el ticket
        if (datosTicket) {
          this.imprimirTicket(datosTicket);
        }

        // Actualizar el estado del la cortesia si es necesario
        const currentInvitado = this.invitado.hasValue() ? this.invitado.value() : null;

        if (currentInvitado && currentInvitado.data?.usado === 'emitido') {
          this.invitadoService.marcarComoUsado(currentInvitado?.data?.id!, this.currentBoletoEmitido()?.id! );
          this.invitadoService.clearInvitado();
        }

        // Despues se limia el boleto emitido actual
        this.boletoEmitidoService.clearCurrentBoletoEmitido();
        this.currentVentaBoletoService.clearState();
        this.carritoBoletos.set([]);
        this.formaPago.reset();
        // Y se navega a otra ruta
        this.router.navigate(['/operador/boletos']);
      }

      if (this.errorBoletoEmitido()) {
        alert(this.errorBoletoEmitido() || 'Error desconocido al emitir el boleto');
        this.boletoEmitidoService.clearError();
      }
    });
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

    const nivelSeleccionado = this.FormIngreso.controls.nivelError.value;
    if (nivelSeleccionado) {
      this.ConfiguracionQR.setactualizarNivelErrorQR(nivelSeleccionado as NivelCorreccionQR);
    }

    // Lógica para emitir la venta de boletos
    const payload: EmitirBoleto = {
      nombre: this.currentVentaBoletoService.state().visitante?.nombre!,
      edad: this.currentVentaBoletoService.state().visitante?.edad!,
      cp: this.currentVentaBoletoService.state().visitante?.cp!,
      pais: this.currentVentaBoletoService.state().visitante?.pais!,
      estado: this.currentVentaBoletoService.state().visitante?.estado!,
      municipio: this.currentVentaBoletoService.state().visitante?.municipio!,
      cantidadHombres: this.currentVentaBoletoService.state().visitante?.cantidadHombres!,
      cantidadMujeres: this.currentVentaBoletoService.state().visitante?.cantidadMujeres!,
      cantidadOtros: this.currentVentaBoletoService.state().visitante?.cantidadOtros!,
      total: this.totalMonto(),
      carritoBoletos: this.carritoBoletos().map((boleto) => {
        return {
          boletoTipoId: boleto.id,
          cantidad: boleto.cantidad
        }
      }),
      usuarioId: this.user()?.id ?? 0,
      museoId: this.user()?.museoId ?? 0,
      formaPagoId: this.formaPago.valid ? this.formaPago.value ?? 0 : 0
    };

    this.boletoEmitidoService.emitirBoletoVenta(payload);

    //Obener el nivel de error QR
    console.log('Nivel de error QR:', this.ConfiguracionQR.getDescripcionNivelErrorQR());
  }

  private imprimirTicket(boletoEmitido: BoletoEmitidoInfo): void {
    console.log('\nEnviando ticket a impresión...');
    this.printingService.imprimirTicket(boletoEmitido);
  }

  verVistaPrevia(): void {
    const boletoEmitido = this.currentBoletoEmitido();
    if (boletoEmitido) {
      this.printingService.vistaPrevia(boletoEmitido);
    }
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
    initFlowbite();
  }
}