import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-productos-delete',
  templateUrl: './productos-delete.html',
  styleUrls: ['./productos-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosDelete {
  readonly producto = input<{
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
  }>();

  protected readonly modalId = computed(() => `popup-modal-${this.producto()?.id}`);

  agreeToDelete = output<boolean>();

  onClickAgree() {
    this.agreeToDelete.emit(true);
  }
}
