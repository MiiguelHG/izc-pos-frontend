import { Component, signal } from '@angular/core';

import { Paginacion } from "../../../paginacion/paginacion";
import { BoletosCreate } from '../boletos-create/boletos-create';
import { BoletosDelete } from '../boletos-delete/boletos-delete';
import { BoletosEdit } from '../boletos-edit/boletos-edit';
import { initFlowbite } from 'flowbite';

interface Boleto {
  id: number;
  nombre: string;
  price: number;
  discount: number;
  
}

@Component({
  selector: 'app-boletos-list',
  imports: [Paginacion, BoletosCreate, BoletosDelete, BoletosEdit],
  templateUrl: './boletos-list.html',
  styleUrls: ['./boletos-list.css'],
})
export class BoletosList {

boletos = signal<Boleto[]>([
    { id: 1, nombre: 'Normal', price: 76, discount: 0 },
    { id: 2, nombre: 'Niños', price: 76, discount: 100 },
    { id: 3, nombre: 'Estudiantes', price: 76, discount: 50 },
    { id: 4, nombre: 'Tercera edad', price: 76, discount: 100 },
    { id: 5, nombre: 'Vip', price: 76, discount: 100 },
]);

  // Esto se ejecuta cada vez que el componente se renderiza
  ngAfterViewInit() {
    initFlowbite(); // re-inicializa todos los modales, dropdowns, etc.
  }


  deleteBoleto(id: number) {
    this.boletos.set(this.boletos().filter(boleto => boleto.id !== id));
  }

  updateBoleto(updatedBoleto: Boleto) {
    // Actualizar el boleto en el array
    this.boletos.update(boletos => 
      boletos.map(boleto => 
        boleto.id === updatedBoleto.id ? updatedBoleto : boleto
      )
    );
  }

  createBoletos(newBoletoData: Omit<Boleto, 'id'>) {
    // Generar un nuevo ID (el máximo ID actual + 1)
    const maxId = Math.max(...this.boletos().map(m => m.id), 0);
    const newBoleto: Boleto = {
      id: maxId + 1,
      ...newBoletoData
    };
    
    // Agregar el nuevo boleto al array
    this.boletos.update(boletos => [...boletos, newBoleto]);
  }
}