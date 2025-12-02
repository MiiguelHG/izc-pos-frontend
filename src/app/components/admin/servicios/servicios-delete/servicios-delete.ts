import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-servicios-delete',
  templateUrl: './servicios-delete.html',
  styleUrls: ['./servicios-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosDelete {
  readonly servicio = input<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  protected readonly modalId = computed(() => `popup-modal-${this.servicio()?.id}`);

  agreeToDelete = output<boolean>();

  onClickAgree() {
    this.agreeToDelete.emit(true);
  }
}
