import { afterEveryRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-boletos-vendidos-admin',
  imports: [],
  templateUrl: './boletos-vendidos-admin.html',
  styleUrl: './boletos-vendidos-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosVendidosAdmin {
  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    })
  }

}
