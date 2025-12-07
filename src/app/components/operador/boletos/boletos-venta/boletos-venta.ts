import { afterEveryRender, Component, computed, effect, inject, signal } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { BoletosService } from '../../../../services/boletos/boletos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { BoletosCarrito } from '../../../../interfaces/boletos-carrito.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormaPagoService } from '../../../../services/formaPago/forma-pago.service';
import { EmitirBoleto } from '../../../../interfaces/emitir-boleto.interface';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';

@Component({
  selector: 'app-boletos-venta',
  imports: [ReactiveFormsModule],
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

  protected boletosTipos = this.boletosService.boletosTipos;
  protected formasPago = this.formaPagoService.formasPago;
  protected user = this.authService.user;
  protected currentBoletoEmitido = this.boletoEmitidoService.currentBoletoEmitido;

  readonly carritoBoletos = signal<BoletosCarrito[]>([]); 

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

  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    });

    this.activatedRoute.queryParamMap.subscribe((params) => {
      const visitanteId = params.get('visitanteId');
      this.visitanteId.set(visitanteId ? +visitanteId : null);
      const totalVisitantes = params.get('totalVisitantes');
      this.totalVisitantes.set(totalVisitantes ? +totalVisitantes : null);
    });

    effect(() => {
      if (this.currentBoletoEmitido()) {
        // Aqui se puede implementar la logica para enviar la info a imprimir

        // Despues se limia el boleto emitido actual
        this.boletoEmitidoService.clearCurrentBoletoEmitido();
        this.carritoBoletos.set([]);
        this.formaPago.reset();
        // Y se navega a otra ruta
      }
    })
  }

  agregarAlCarrito(boletoTipo: BoletoTipo) {
    if (this.limiteAlcanzado()) {
      return; // No agregar si ya se alcanzó el límite
    }
    this.carritoBoletos.update((carrito) => [
      ...carrito,
      { ...boletoTipo, cantidad: 1 },
    ]);
  }

  eliminarDelCarrito(boletoTipoId: number):void {
    this.carritoBoletos.update((carrito) =>{
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

  emitirVenta():void {
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

  }
}