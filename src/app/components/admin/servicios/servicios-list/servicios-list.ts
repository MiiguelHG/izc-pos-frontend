import { Component, signal, AfterViewInit } from '@angular/core';
import { ServiciosEdit } from "../servicios-edit/servicios-edit";
import { ServiciosDelete } from "../servicios-delete/servicios-delete";
import { ServiciosCreate } from "../servicios-create/servicios-create";
import { Paginacion } from "../../../paginacion/paginacion";


import { initFlowbite } from 'flowbite';

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
}

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [ServiciosEdit, ServiciosDelete, ServiciosCreate, Paginacion],
  templateUrl: './servicios-list.html',
  styleUrls: ['./servicios-list.css'],
})
export class ServiciosList implements AfterViewInit {

  servicios = signal<Servicio[]>([
    { id: 1, nombre: 'Servicio de baños', precio: 10, descuento: 0 },
    { id: 2, nombre: 'Servicio de fotografías', precio: 15, descuento: 5 },
    { id: 3, nombre: 'Renta de espacio o museo', precio: 50, descuento: 10 }
  ]);

  // Esto se ejecuta cada vez que el componente se renderiza
  ngAfterViewInit() {
    initFlowbite(); // re-inicializa todos los modales, dropdowns, etc.
  }

  createServicio(newServicioData: Omit<Servicio, 'id'>) {
    const maxId = Math.max(...this.servicios().map(s => s.id), 0);
    const newServicio: Servicio = { id: maxId + 1, ...newServicioData };
    this.servicios.update(servicios => [...servicios, newServicio]);
  }

  updateServicio(updatedServicio: Servicio) {
    this.servicios.update(servicios =>
      servicios.map(s => s.id === updatedServicio.id ? updatedServicio : s)
    );
  }

  deleteServicio(id: number) {
    this.servicios.set(this.servicios().filter(s => s.id !== id));
  }
}
