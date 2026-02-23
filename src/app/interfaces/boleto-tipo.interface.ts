export interface BoletoTipo {
  id?: number;
  nombre: string;
  descripcion: string;
  descuento: number;
  precioFinal?: number;
  dias: Array<number>;
  habilitado?: boolean;
  esEspecial: boolean;
  articuloId: number;
}
