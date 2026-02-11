export interface BoletoTipo {
  id?: number;
  nombre: string;
  descripcion: string;
  descuento: number;
  precioFinal?: number;
  esEspecial: boolean;
  articuloId: number;
}
