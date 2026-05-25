import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { UsuariosEdit } from '../usuarios-edit/usuarios-edit';
import { UsuariosDelete } from '../usuarios-delete/usuarios-delete';
import { UsuariosCreate } from '../usuarios-create/usuarios-create';
import { initModals } from 'flowbite';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { User } from '../../../../interfaces/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Paginacion } from "../../../paginacion/paginacion";
import { CreateUsuario } from '../../../../interfaces/create-usuario.interface';
import { AuthService } from '../../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-usuarios-list',
  imports: [UsuariosEdit, UsuariosDelete, UsuariosCreate, Paginacion, ReactiveFormsModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosList {
  private readonly SEARCH_DEBOUNCE_MS = 700;

  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  protected usuarios = this.usuariosService.usuarios;

  protected searchUser = new FormControl<string>('', { nonNullable: true });


  constructor() {

    effect(() => {
      // Solo si ya no está cargando, hay datos y no hay error, inicializamos Flowbite
      if (!this.usuarios.isLoading() && this.usuarios.value()?.data && !this.usuarios.error()) {
        initModals();
      }
    });

    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const search = params['search'] ? params['search'] : '';
      this.usuariosService.setSearch(search);
      this.searchUser.setValue(search, { emitEvent: false });
      
      const page = params['page'] ? params['page'] : '1';
      this.usuariosService.currentPage.set(page);
    });

    this.searchUser.valueChanges.pipe(
      map((value) => value.trim()),
      debounceTime(this.SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((value) => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { search: value || null, page: 1 },
        queryParamsHandling: 'merge'
      });
    });

  }

  createUsuario(newUsuarioData: CreateUsuario) {
    this.authService.register(newUsuarioData);
  }

  updateUsuario(updatedUsuario: User) {
    const { id, rol, museo, ...usuarioData } = updatedUsuario;
    if (id) {
      this.usuariosService.updateUsuario(id, usuarioData);
    }
  }

  toggleEstado(id: number, estadoActual: boolean) {
    this.usuariosService.updateUsuario(id, { activo: !estadoActual });
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

}
