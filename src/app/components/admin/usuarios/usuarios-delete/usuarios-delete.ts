import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { User } from '../../../../interfaces/user.interface';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-usuarios-delete',
  imports: [],
  templateUrl: './usuarios-delete.html',
  styleUrls: ['./usuarios-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosDelete {
  protected usuariosService = inject(UsuariosService);
  protected authService = inject(AuthService);

  readonly usuario = input.required<User>();
  protected readonly modalId = computed(() => `popup-modal-${this.usuario()?.id}`);

  agreeToDelete = output<number>();

  protected esMismoUsuario = () => this.authService.user()?.id === this.usuario().id;

  onToggleUserActivete() {
    const id = this.usuario().id || 0;
    this.usuariosService.toggleUsuarioActivo(id);
  }
}