import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-museos-delete',
  templateUrl: './museos-delete.html',
  styleUrls: ['./museos-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseosDelete {
  readonly museo = input<{
    id: number;
    nombre: string;
    responsable: string;
    ubicacion: string;
  }>();

  protected readonly modalId = computed(() => `popup-modal-${this.museo()?.id}`);

  agreeToDelete = output<boolean>();

  onClickAgree() {
    this.agreeToDelete.emit(true);
  }
}
