import { Component, signal } from '@angular/core';
import { MuseosEdit } from "../museos-edit/museos-edit";
import { MuseosDelete } from "../museos-delete/museos-delete";
import { MuseosCreate } from "../museos-create/museos-create";
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';

interface Museo {
  id: number;
  nombre: string;
  responsable: string;
  ubicacion: string;
}

@Component({
  selector: 'app-museos-list',
  imports: [MuseosEdit, MuseosDelete, MuseosCreate, Paginacion],
  templateUrl: './museos-list.html',
  styleUrl: './museos-list.css',
})
export class MuseosList {
  museos = signal<Museo[]>([
    { id: 1, nombre: 'Museo de Arte', responsable: 'Juan Pérez', ubicacion: 'Calle 123, Col. Centro, C.P. 98000, Zacatecas, MX' },
    { id: 2, nombre: 'Museo de Historia', responsable: 'María López', ubicacion: 'Avenida 456, Col. Centro, C.P. 98000, Zacatecas, MX' },
    { id: 3, nombre: 'Museo de Ciencias', responsable: 'Carlos Sánchez', ubicacion: 'Boulevard 789, Col. Centro, C.P. 98000, Zacatecas, MX' },
    { id: 4, nombre: 'Museo de Antropología', responsable: 'Ana Gómez', ubicacion: 'Calle 321, Col. Centro, C.P. 98000, Zacatecas, MX' },
  ]);

  ngAfterViewInit() {
    initFlowbite();
  }

  deleteMuseo(id: number) {
    this.museos.set(this.museos().filter(museo => museo.id !== id));
  }

  updateMuseo(updatedMuseo: Museo) {
    // Actualizar el museo en el array
    this.museos.update(museos => 
      museos.map(museo => 
        museo.id === updatedMuseo.id ? updatedMuseo : museo
      )
    );
  }

  createMuseo(newMuseoData: Omit<Museo, 'id'>) {
    // Generar un nuevo ID (el máximo ID actual + 1)
    const maxId = Math.max(...this.museos().map(m => m.id), 0);
    const newMuseo: Museo = {
      id: maxId + 1,
      ...newMuseoData
    };
    
    // Agregar el nuevo museo al array
    this.museos.update(museos => [...museos, newMuseo]);
  }
}
