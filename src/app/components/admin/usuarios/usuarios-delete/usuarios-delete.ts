import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-usuarios-delete',
  templateUrl: './usuarios-delete.html',
  styleUrls: ['./usuarios-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosDelete {
  readonly usuario = input<{
    id: number;
    nombre: string;
    correo: string;
    activo: boolean;
  }>();

  protected readonly modalId = computed(() => `popup-modal-${this.usuario()?.id}`);

  agreeToDelete = output<boolean>();

  onClickAgree() {
    this.agreeToDelete.emit(true);
  }
}
