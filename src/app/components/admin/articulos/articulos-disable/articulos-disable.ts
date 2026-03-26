import { afterNextRender, Component, computed, input, output } from '@angular/core';
import { initModals } from 'flowbite';
import { Articulo } from '../../../../interfaces/articulo.interface';

@Component({
  selector: 'app-articulos-disable',
  templateUrl: './articulos-disable.html',
  styleUrl: './articulos-disable.css',
})
export class ArticulosDisable {

  articulo = input<Articulo>();

  toggleArticulo = output<number>();

  protected modalId = computed(() =>
    `toggle-articulo-${this.articulo()?.id}`
  );

  protected estaHabilitado = computed(() =>
    this.articulo()?.habilitado ?? true
  );

  constructor() {
    afterNextRender(() => initModals());
  }

  confirmar() {
    const articulo = this.articulo();
    if (!articulo) return;

    this.toggleArticulo.emit(articulo.id!);
  }

}