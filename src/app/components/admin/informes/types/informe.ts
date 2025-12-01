export type TipoInforme = 'visitantes' | 'ingresos';

export interface FiltrosVisitantes {
  edad?: { min: number; max: number };
  genero?: 'masculino' | 'femenino' | 'otro' | 'todos';
  procedencia?: string;
  tipoVisita?: 'individual' | 'grupo' | 'escolar' | 'todos';
}

export interface FiltrosIngresos {
  categoriaProducto?: string;
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';
  tipoIngreso?: 'boletos' | 'tienda' | 'servicios';
}

export interface FiltrosInforme {
  startDate: string;
  endDate: string;
  reportType: TipoInforme;
  filtrosVisitantes?: FiltrosVisitantes;
  filtrosIngresos?: FiltrosIngresos;
}
