import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BoletoEmitidoService } from '../../../../services/boletoEmitido/boleto-emitido.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Paginacion } from "../../../paginacion/paginacion";
import { HttpErrorResponse } from '@angular/common/http';
import { BoletoInfo } from '../boleto-info/boleto-info';
import { formatProcedencia } from '../../../../helpers/index';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-boletos-vendidos',
  imports: [DatePipe, Paginacion, RouterModule, BoletoInfo, ReactiveFormsModule], 
  templateUrl: './boletos-vendidos.html',
  styleUrl: './boletos-vendidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosVendidos {
  private readonly SEARCH_DEBOUNCE_MS = 700;

  protected readonly formatProcedencia = formatProcedencia;
  private boletoEmitidoService = inject(BoletoEmitidoService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); 

  protected readonly isChildRouteActive = signal(false);
  protected boletosEmitidosByMuseo = this.boletoEmitidoService.boletosEmitidosByMuseo;
  protected searchBoleto = new FormControl<string>('', { nonNullable: true }); 

  protected errorMessage = computed(() => {
    const error = this.boletosEmitidosByMuseo.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los boletos emitidos';
    return null;
  });

  constructor() {
    this.updateChildRouteState();
    this.router.events.subscribe(() => {
      this.updateChildRouteState();
    });

    // Escucha cambios en query params (page y search)
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const search = params['search'] ?? '';
        this.boletoEmitidoService.setSearch(search);
        this.searchBoleto.setValue(search, { emitEvent: false }); // sincroniza input sin disparar valueChanges

        const page = params['page'] ?? '1';
        this.boletoEmitidoService.currentPage.set(page);
      });

    // Cuando el usuario escribe, actualiza la URL
    this.searchBoleto.valueChanges.pipe(
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

  protected goToRegistro(): void {
    this.router.navigate(['registro'], {
      relativeTo: this.activatedRoute,
    });
  }

  private updateChildRouteState(): void {
    this.isChildRouteActive.set(this.activatedRoute.firstChild !== null);
  }
}