import { afterEveryRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { BoletosCreate } from '../boletos-create/boletos-create';
import { BoletosDelete } from '../boletos-delete/boletos-delete';
import { BoletosEdit } from '../boletos-edit/boletos-edit';
import { initFlowbite } from 'flowbite';
import { BoletosService } from '../../../../services/boletos/boletos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';

interface Boleto {
  id: number;
  nombre: string;
  price: number;
  discount: number;
  
}

@Component({
  selector: 'app-boletos-list',
  imports: [BoletosCreate, BoletosDelete, BoletosEdit],
  templateUrl: './boletos-list.html',
  styleUrls: ['./boletos-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosList {
  private boletosService = inject(BoletosService);
  private authService = inject(AuthService);

  protected boletosTipos = this.boletosService.boletosTipos;

  boletos = signal<Boleto[]>([
      { id: 1, nombre: 'Normal', price: 76, discount: 0 },
      { id: 2, nombre: 'Niños', price: 76, discount: 100 },
      { id: 3, nombre: 'Estudiantes', price: 76, discount: 50 },
      { id: 4, nombre: 'Tercera edad', price: 76, discount: 100 },
      { id: 5, nombre: 'Vip', price: 76, discount: 100 },
  ]);

  constructor() {
    afterEveryRender(() => {
      initFlowbite();
    })
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

  createBoletoTipo(boletoTipo: BoletoTipo) {
    this.boletosService.createBoletoTipo(boletoTipo);
  }
}