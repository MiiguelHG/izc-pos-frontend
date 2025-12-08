import { afterEveryRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-productos-ventas',
  imports: [],
  templateUrl: './productos-ventas.html',
  styleUrl: './productos-ventas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosVentas {
  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    });
  }
}
