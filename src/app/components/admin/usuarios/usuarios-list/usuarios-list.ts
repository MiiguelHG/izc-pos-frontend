import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { UsuariosEdit } from '../usuarios-edit/usuarios-edit';
import { UsuariosDelete } from '../usuarios-delete/usuarios-delete';
import { UsuariosCreate } from '../usuarios-create/usuarios-create';
import { initFlowbite } from 'flowbite';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { User } from '../../../../interfaces/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Paginacion } from "../../../paginacion/paginacion";
import { CreateUsuario } from '../../../../interfaces/create-usuario.interface';
import { AuthService } from '../../../../services/auth/auth.service';


@Component({
  selector: 'app-usuarios-list',
  imports: [UsuariosEdit, UsuariosDelete, UsuariosCreate, Paginacion],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList {

  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  protected usuarios = this.usuariosService.usuarios;


  constructor() {

    effect(() => {
      // Solo si ya no está cargando y nuevos datos están disponibles
      if (!this.usuarios.isLoading() && this.usuarios.value()?.data) {
        initFlowbite();
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? params['page'] : '1';
      this.usuariosService.currentPage.set(page);
    });

  }

  createUsuario(newUsuarioData: CreateUsuario) {
    this.authService.register(newUsuarioData);
    this.usuariosService.reloadUsuarios();
    setTimeout(() => initFlowbite(), 100);
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
    initFlowbite();
  }

}
