import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ArticulosCreate } from "../articulos-create/articulos-create";
import { ArticulosEdit } from "../articulos-edit/articulos-edit";
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { initFlowbite, initModals } from 'flowbite';
import { DecimalPipe } from '@angular/common';
import { Paginacion } from "../../../paginacion/paginacion";
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../services/auth/auth.service';
import { MuseoArticuloService } from '../../../../services/museoArticulos/museo-articulo.service';
import { ArticulosMuseoTable } from '../articulos-museo-table/articulos-museo-table';
import { ArticulosDisable } from '../articulos-disable/articulos-disable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-articulos-list',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    ArticulosCreate,
    ArticulosEdit,
    Paginacion,
    ArticulosMuseoTable,
    ArticulosDisable
  ],
  templateUrl: './articulos-list.html',
  styleUrl: './articulos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticulosList {

  private articulosService = inject(ArticulosService);
  private museoArticuloService = inject(MuseoArticuloService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected articulos = this.articulosService.articulos;
  protected user = this.authService.user;
  protected articulosAsignados = signal<number[]>([]);
  protected tipoArticulo = new FormControl<string>('');
  protected searchArticulo = new FormControl<string>('', { nonNullable: true });
  protected articulosError = computed(() => {
    const error = this.articulos.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los articulos';
    return null;
  });


  constructor() {

    effect(() => {
      const hasError = this.articulos.error();
      const hasValue = this.articulos.hasValue();
      const isLoading = this.articulos.isLoading();

      if (!isLoading && !hasError && hasValue && this.articulos.value()?.data?.data) {
        initModals();
      }
    });

      effect(() => {
      const user = this.user();
      if (!user) return;

      this.articulosService.articulosReload();
    });

    effect(() => {
  const museoId = this.user()?.museoId;
  if (!museoId) return;

  this.museoArticuloService
    .getArticulosDelMuseo(museoId)
    .subscribe({
      next: (res: any) => {
        const ids = res.data?.map((a: any) => a.articuloId) ?? [];
        this.articulosAsignados.set(ids);
      },
      error: (err) => console.error(err),
    });
});


  this.activatedRoute.queryParams
  .pipe(takeUntilDestroyed())
  .subscribe(params => {

    const page = params['page'] ?? '1';
    this.articulosService.currentPage.set(page);

    const tipo = params['tipo'] ?? '';
    this.articulosService.tipoArticulo.set(tipo);
    this.tipoArticulo.setValue(tipo, { emitEvent: false });

    const search = params['search'] ?? '';
    this.articulosService.setSearch(search);
    this.searchArticulo.setValue(search, { emitEvent: false });

  });

  this.tipoArticulo.valueChanges
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    takeUntilDestroyed()
  )
  .subscribe(value => {

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        tipo: value || null, 
        page: '1'
      },
      queryParamsHandling: 'merge'
    });

  });

  this.searchArticulo.valueChanges
  .pipe(
    map(value => value.trim()),
    debounceTime(500),
    distinctUntilChanged(),
    takeUntilDestroyed()
  )
  .subscribe(value => {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        search: value || null,
        page: '1'
      },
      queryParamsHandling: 'merge'
    });
  });
  }

  createArticulo(articulo: Articulo) {
    this.articulosService.createArticulo(articulo);
  }

  updateArticulo(articulo: Articulo) {
    const payload = { ...articulo };
    delete payload.id;

    this.articulosService.editArticulo(articulo.id!, payload);
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  agregarAlMuseo(articuloId: number) {
    const museoId = this.user()?.museoId;
    if (!museoId) return;

    this.museoArticuloService
      .agregarArticuloAMuseo(museoId, articuloId)
      .subscribe({
        next: () => {
          //Recargar tabla de artículos del museo
          this.museoArticuloService.recargarProductos();

          // Volver a consultar asignados para deshabilitar botón
          this.museoArticuloService
            .getArticulosDelMuseo(museoId)
            .subscribe({
              next: (res: any) => {
                const ids = res.data?.map((a: any) => a.articuloId) ?? [];
                this.articulosAsignados.set(ids);
              }
            });
        },
        error: (err) => console.error(err),
      });
  }


  estaAgregadoAlMuseo(articuloId: number): boolean {
    return this.articulosAsignados().includes(articuloId);
  }

  toggleArticulo(id: number) {
    this.articulosService.toggleArticulo(id);
  }

}
