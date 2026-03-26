import { Component, input, output, computed, afterNextRender} from '@angular/core';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { initModals } from 'flowbite';

@Component({
  selector: 'app-articulos-museo-toggle',
  standalone: true,
  templateUrl: './articulos-museo-toggle.html'
})
export class ArticulosMuseoToggle {

  articulo = input<Articulo>();

  confirmToggle = output<Articulo>();

  protected modalId = computed(() =>
    `toggle-articulo-museo-${this.articulo()?.id}`
  );
constructor() {
  afterNextRender(() => initModals());
}
  onConfirm() {

  const articulo = this.articulo();
  if (!articulo) return;

  this.confirmToggle.emit(articulo);

}

}