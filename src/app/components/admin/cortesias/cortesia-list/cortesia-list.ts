import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { CortesiaCreate } from '../cortesia-create/cortesia-create';
import { CortesiaEdit } from '../cortesia-edit/cortesia-edit';
import { CortesiaCancelar } from '../cortesia-cancelar/cortesia-cancelar';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { InvitadosService } from '../../../../services/invitados/invitados.service';
import { Paginacion } from "../../../paginacion/paginacion";
import { initModals } from 'flowbite';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-cortesia-list',
  imports: [CortesiaCreate, CortesiaEdit, CortesiaCancelar, Paginacion, ReactiveFormsModule],
  providers: [InvitadosService],
  templateUrl: './cortesia-list.html',
  styleUrl: './cortesia-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaList {
  private readonly SEARCH_DEBOUNCE_MS = 700;

  private invitadoService = inject(InvitadosService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  protected invitados = this.invitadoService.invitados;
  protected searchCortesia = new FormControl<string>('', { nonNullable: true });

  protected invitadosError = computed(() => {
    const error = this.invitados.error() as HttpErrorResponse | null;
    if (error) return error.error?.message || 'Error desconocido al cargar los invitados';
    return null;
  });

  constructor() {
    effect(() => {
      if (!this.invitados.isLoading() && !this.invitados.error() && this.invitados.value()?.data) {
        initModals();
      }
    });

    // Escucha cambios en query params (page y search)
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const search = params['search'] ?? '';
        this.invitadoService.setSearch(search);
        this.searchCortesia.setValue(search, { emitEvent: false }); // sincroniza input sin disparar valueChanges

        const page = params['page'] ? +params['page'] : 1;
        this.invitadoService.setPage(page);
      });

    // Cuando el usuario escribe, actualiza la URL
    this.searchCortesia.valueChanges.pipe(
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

  nuevoInvitado(invitado: Invitado) {
    this.invitadoService.createInvitado(invitado);
  }

  editarInvitado(invitado: Invitado) {
    this.invitadoService.updateInvitado(invitado);
  }

  cancelarInvitado(invitadoId: number) {
    this.invitadoService.cancelarInvitado(invitadoId);
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}