import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-usuarios-delete',
  imports: [],
  templateUrl: './usuarios-delete.html',
  styleUrls: ['./usuarios-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosDelete {
  readonly usuario = input.required<User>();
  protected readonly modalId = computed(() => `popup-modal-${this.usuario()?.id}`);

  agreeToDelete = output<number>();

  onClickAgree() {
    const id = this.usuario().id;
    if (id !== undefined) {
      this.agreeToDelete.emit(id);
    }
  }
}
