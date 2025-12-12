import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

import { BoletosCreate } from '../boletos-create/boletos-create';
import { BoletosEdit } from '../boletos-edit/boletos-edit';
import { initFlowbite } from 'flowbite';
import { BoletosService } from '../../../../services/boletos/boletos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';

@Component({
  selector: 'app-boletos-list',
  imports: [BoletosCreate, BoletosEdit],
  templateUrl: './boletos-list.html',
  styleUrls: ['./boletos-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoletosList {
  private boletosService = inject(BoletosService);

  protected boletosTipos = this.boletosService.boletosTipos;

  constructor() {

    // Detectar cambios en boletosTipos
    effect(() => {
      const datos = this.boletosTipos.value();
      const cargando = this.boletosTipos.isLoading();
      
      // Solo ejecutar cuando hay datos válidos y no está cargando
      if (datos?.data && !cargando) {
        setTimeout(() => {
          initFlowbite();
        }, 0)
      }
    });
  }

  updateBoletoTipo(updatedBoletoTipo: BoletoTipo) {
    // Actualizar el boleto en el array
    const payload = {...updatedBoletoTipo};
    delete payload.id;
    this.boletosService.updateBoletoTipo(updatedBoletoTipo.id!, payload);
  }

  createBoletoTipo(boletoTipo: BoletoTipo) {
    this.boletosService.createBoletoTipo(boletoTipo);
  }
}