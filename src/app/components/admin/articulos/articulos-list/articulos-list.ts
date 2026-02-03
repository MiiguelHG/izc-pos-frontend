import { Component, effect, inject } from '@angular/core';
import { ArticulosCreate } from "../articulos-create/articulos-create";
import { ArticulosEdit } from "../articulos-edit/articulos-edit";
import { ArticulosService } from '../../../../services/articulos/articulos.service';
import { initFlowbite } from 'flowbite';
import { DecimalPipe } from '@angular/common';
import { Paginacion } from "../../../paginacion/paginacion";
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-articulos-list',
  imports: [ReactiveFormsModule, DecimalPipe, ArticulosCreate, ArticulosEdit, Paginacion],
  templateUrl: './articulos-list.html',
  styleUrl: './articulos-list.css',
})
export class ArticulosList {
  private articulosService = inject(ArticulosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected articulos = this.articulosService.articulos;
  protected user = this.authService.user;

  protected tipoArticulo = new FormControl<String>('');

  constructor() {
    effect(() => {
      if (this.articulos.value()?.data?.data && !this.articulos.isLoading()) {
        initFlowbite();
      }
    })

    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const page = params['page'] ? params['page'] : '1';
        this.articulosService.currentPage.set(page);

        const tipo = params['tipo'] ? params['tipo'] : '';
        this.articulosService.tipoArticulo.set(tipo);

        this.tipoArticulo.setValue(tipo, { emitEvent: false });
      });

    this.tipoArticulo.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(value => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tipo: value, page: '1' },
        queryParamsHandling: 'merge'
      });
    })
  }

  createArticulo(articulo: Articulo) {
    this.articulosService.createArticulo(articulo);
  }

  updateArticulo(articulo: Articulo) {
    const payload = { ...articulo}
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

}
