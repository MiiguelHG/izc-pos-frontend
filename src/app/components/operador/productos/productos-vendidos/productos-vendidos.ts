import {
  Component,
  signal,
  computed,
  afterEveryRender,
  inject,
  effect,
  afterNextRender
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { ActivatedRoute, Router,RouterModule } from '@angular/router';
import { Paginacion } from '../../../paginacion/paginacion';
import { ProductoVerVenta } from '../producto-info/producto-info';
import { ProductoVentaService } from '../../../../services/productoVenta/producto-venta.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ProductoVenta } from '../../../../interfaces/producto-venta.interface';


@Component({
  selector: 'app-productos-venta',
  standalone: true,
  imports: [
    ProductoVerVenta,
    RouterModule,
    DatePipe,
    DecimalPipe,
    Paginacion
  ],
  templateUrl: './productos-vendidos.html',
  styleUrl: './productos-vendidos.css',
})
export class ProductosVenta {

  private productoVentaService = inject(ProductoVentaService);
  private authService = inject(AuthService);
  
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  protected ventas = this.productoVentaService.ventas;
  protected user = this.authService.user;
protected readonly isChildRouteActive = signal(false);

private updateChildRouteState(): void {
  this.isChildRouteActive.set(this.activatedRoute.firstChild !== null);
}

  protected goToNuevaVenta(): void {
    this.router.navigate(['listado-articulos'], {
      relativeTo: this.activatedRoute,
    });
  }

  Busqueda = signal<string>('');
  currentPage = signal<number>(1);


  constructor() {
  afterNextRender(() => initFlowbite());

  // 👇 Cargar ventas al iniciar (SOLUCION AL F5)
  effect(() => {
    const user = this.user();

    if (user?.museoId) {
      this.productoVentaService.museoId.set(user.museoId);
      this.productoVentaService.recargarVentas();
    }
  });

  this.updateChildRouteState();

  this.router.events.subscribe(() => {
    this.updateChildRouteState();

    if (!this.activatedRoute.firstChild) {
      const museoId = this.user()?.museoId;

      if (museoId) {
        this.productoVentaService.museoId.set(museoId);
        this.productoVentaService.recargarVentas();
      }
    }
  });

  this.activatedRoute.queryParams.subscribe(params => {
    const page = params['page'] ? Number(params['page']) : 1;
    this.productoVentaService.currentPage.set(page);
  });
}



  ventasData = computed(() => {
    return this.ventas.value()?.data?.ventas ?? [];
  });

  productosFiltrados = computed(() => {
    const termino = this.Busqueda().toLowerCase().trim();
    const ventas = this.ventasData();

    if (!termino) return ventas;

    return ventas.filter((venta: ProductoVenta) =>
      venta.id.toString().includes(termino) ||
      venta.fechaVenta.toLowerCase().includes(termino) ||
      venta.total.toString().includes(termino)
    );
  });

  protected onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }


  actualizarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.Busqueda.set(input.value);
  }
}
