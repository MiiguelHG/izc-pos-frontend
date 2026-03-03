import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResumenInforme } from '../../../../interfaces/informe-resumen.interface';
import { TipoInforme } from '../../../../interfaces/tipo-informe.type';

@Component({
  selector: 'app-resumen',
  imports: [],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Resumen {
  currentResumen = input<ResumenInforme>();
  tipo = input<TipoInforme>();

  protected formatDate(fecha: string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

}
