import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Museo } from '../../../../interfaces/museo.interface';

@Component({
  selector: 'app-museos-delete',
  templateUrl: './museos-delete.html',
  styleUrls: ['./museos-delete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseosDelete {
  readonly museo = input<Museo>();

  protected readonly modalId = computed(() => `popup-modal-${this.museo()?.id}`);

  agreeToDelete = output<number>();

  onClickAgree() {
    this.agreeToDelete.emit(this.museo()?.id!);
  }
}
