import { ChangeDetectionStrategy, Component, effect, inject} from '@angular/core';

import { BoletosCreate } from '../boletos-create/boletos-create';
import { BoletosEdit } from '../boletos-edit/boletos-edit';
import { BoletosHabilitarDeshabilitar } from '../boletos-habilitar-deshabilitar/boletos-habilitar-deshabilitar';
import { initFlowbite } from 'flowbite';
import { BoletosService } from '../../../../services/boletos/boletos.service';
import { BoletoTipo } from '../../../../interfaces/boleto-tipo.interface';
import { DecimalPipe } from '@angular/common';
import { BoletosPrecioBase } from "../boletos-precio-base/boletos-precio-base";

@Component({
  selector: 'app-boletos-list',
  imports: [BoletosCreate, BoletosEdit, BoletosHabilitarDeshabilitar, DecimalPipe, BoletosPrecioBase],
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
      // Solo ejecutar cuando hay datos válidos y no está cargando
      if (this.boletosTipos.value()?.data && !this.boletosTipos.isLoading()) {
        initFlowbite();
      }
    });
  }

  updateBoletoTipo(updatedBoletoTipo: BoletoTipo) {
    // Actualizar el boleto en el array
    const payload = {...updatedBoletoTipo};
    delete payload.id;
    this.boletosService.updateBoletoTipo(updatedBoletoTipo.id!, payload);
  }

  updateAllBoletos(payload: { articuloId: number, precioEstandar: number }) {
    this.boletosService.updatePrecioBoletos(payload.precioEstandar, payload.articuloId);
  }

  createBoletoTipo(boletoTipo: BoletoTipo) {
    this.boletosService.createBoletoTipo(boletoTipo);
  }

  toggleBoletoTipo(id: number) {
    this.boletosService.toggleBoletoTipo(id);
  }

  getDayLetters(dias: number[]): string {
    const dayMap: { [key: number]: string } = {
      0: 'D',  
      1: 'L',
      2: 'M',
      3: 'Mi',
      4: 'J',
      5: 'V',
      6: 'S'
    };

    return dias.map(day => dayMap[day]).join(', ');
  }
}