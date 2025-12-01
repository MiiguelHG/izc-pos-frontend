import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-boletos-delete',
  imports: [],
  templateUrl: './boletos-delete.html',
  styleUrl: './boletos-delete.css',
})
export class BoletosDelete {
  readonly boleto = input<{
    id: number;
    nombre: string;
    price: number;
    discount: number;
  }>();

  protected readonly modalId = computed(() => `popup-modal-${this.boleto()?.id}`);

  agreeToDelete = output<boolean>();

  onClickAgree() {
    this.agreeToDelete.emit(true);
  }
}
