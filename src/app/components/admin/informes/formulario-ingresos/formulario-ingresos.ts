import { afterNextRender, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-formulario-ingresos',
  imports: [],
  templateUrl: './formulario-ingresos.html',
  styleUrl: './formulario-ingresos.css',
})
export class FormularioIngresos {
  constructor() {
    afterNextRender(() => initFlowbite());
  }
}
