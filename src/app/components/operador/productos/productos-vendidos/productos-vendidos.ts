import {
  Component,
  signal,
  inject,
  effect,
  DestroyRef
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Paginacion } from '../../../paginacion/paginacion';
import { ProductoVerVenta } from '../producto-info/producto-info';
import { ProductoVentaService } from '../../../../services/productoVenta/producto-venta.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-productos-venta',
  standalone: true,
  imports: [
    ProductoVerVenta,
    RouterModule,
    DatePipe,
    DecimalPipe,
    Paginacion,
    ReactiveFormsModule,
  ],
  templateUrl: './productos-vendidos.html',
  styleUrl: './productos-vendidos.css',
})
export class ProductosVenta {
  private readonly SEARCH_DEBOUNCE_MS = 700;

  private productoVentaService = inject(ProductoVentaService);
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); 

  protected ventas = this.productoVentaService.ventas;
  protected user = this.authService.user;
  protected readonly isChildRouteActive = signal(false);
  protected searchVenta = new FormControl<string>('', { nonNullable: true }); 

  constructor() {
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

    // Escucha cambios en query params (page y search)
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const search = params['search'] ?? '';
        this.productoVentaService.setSearch(search);
        this.searchVenta.setValue(search, { emitEvent: false });

        const page = params['page'] ? Number(params['page']) : 1;
        this.productoVentaService.currentPage.set(page);
      });

    // Cuando el usuario escribe, actualiza la URL
    this.searchVenta.valueChanges.pipe(
      map(value => value.trim()),
      debounceTime(this.SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { search: value || null, page: 1 },
        queryParamsHandling: 'merge',
      });
    });
  }

  protected onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  protected goToNuevaVenta(): void {
    this.router.navigate(['listado-articulos'], {
      relativeTo: this.activatedRoute,
    });
  }

  private updateChildRouteState(): void {
    this.isChildRouteActive.set(this.activatedRoute.firstChild !== null);
  }
}