import { Component, computed, effect, inject, signal } from '@angular/core';
import { BoletosService } from '../../../../services/boletos/boletos.service';
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
import { ToastService } from '../../../../services/toast/toast.service';
import { BoletoEmitidoInfo } from '../../../../interfaces/boleto-emitido-info.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Paginacion } from '../../../paginacion/paginacion';


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
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  private formBuilder = inject(FormBuilder);
  private printingService = inject(Printing);
  private invitadoService = inject(InvitadosPendientesService);
  private ConfiguracionQR = inject(ConfiguracionQRService)
  private currentVentaBoletoService = inject(CurrentVentaBoletoService);
  private toastService = inject(ToastService);

  protected boletosTipos = this.boletosService.boletosTipos;
  protected formasPago = this.formaPagoService.formasPago;
  protected currentBoletoEmitido = this.boletoEmitidoService.currentBoletoEmitido;
  protected invitado = this.invitadoService.invitado;
  protected toast = this.toastService;

  readonly carritoBoletos = signal<BoletosCarrito[]>([]);

  protected totalVisitantes = computed(() => {
    const currentVenta = this.currentVentaBoletoService.state().visitante?.totalVisitantes;
    return currentVenta ?? 0;
  });

  protected isGroup = computed(() => this.currentVentaBoletoService.state().isGroup ?? false);

  
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

  protected goToRegistro(): void {
    this.router.navigate(['/operador/boletos/registro']);
  }

  private showToast(type: 'success' | 'error', message: string): void {
    if (type === 'success') {
      this.toastService.showSuccess(message);
      return;
    }

    this.toastService.showError(message);
  }

  constructor() {
    this.formaPagoService.recargar();

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
          this.imprimirTicket(datosTicket, this.isGroup());
        }

        // Actualizar el estado del la cortesia si es necesario
        const currentInvitado = this.invitado.hasValue() ? this.invitado.value() : null;

        if (currentInvitado && currentInvitado.data?.usado === 'emitido') {
          this.invitadoService.marcarComoUsado(currentInvitado?.data?.id!, this.currentBoletoEmitido()?.id! );
          this.invitadoService.clearInvitado();
        }

        // Extraer el ID del boleto emitido para el highlight
        const boletoId = this.currentBoletoEmitido()?.id;

        // Mostrar toast de éxito
        this.showToast('success', `Boleto #${boletoId} generado exitosamente`);

        // Despues se limia el boleto emitido actual
        this.boletoEmitidoService.clearCurrentBoletoEmitido();
        this.currentVentaBoletoService.clearState();
        this.carritoBoletos.set([]);
        this.formaPago.reset();
        // Y se navega a otra ruta con el ID del boleto para destacarlo
        this.router.navigate(['/operador/boletos'], {
          queryParams: { highlightId: boletoId }
        });
      }

      if (this.errorBoletoEmitido()) {
        this.showToast('error', 'Operación fallida');
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
      cp: this.currentVentaBoletoService.state().visitante?.cp || null,
      pais: this.currentVentaBoletoService.state().visitante?.pais!,
      estadoId: this.currentVentaBoletoService.state().visitante?.estadoId || null,
      municipioId: this.currentVentaBoletoService.state().visitante?.municipioId || null,
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
      formaPagoId: this.formaPago.valid ? this.formaPago.value ?? 0 : 0
    };

    this.boletoEmitidoService.emitirBoletoVenta(payload);
  }

  private imprimirTicket(boletoEmitido: BoletoEmitidoInfo, isGroup: boolean): void {
    console.log('\nEnviando ticket a impresión...');
    this.printingService.imprimirTicket(boletoEmitido, isGroup);
  }

  verVistaPrevia(): void {
    const boletoEmitido = this.currentBoletoEmitido();
    const isGroup = this.isGroup();
    if (boletoEmitido) {
      this.printingService.vistaPrevia(boletoEmitido, isGroup);
    }
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}