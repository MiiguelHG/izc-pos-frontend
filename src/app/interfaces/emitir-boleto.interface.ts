export interface EmitirBoleto {
  nombre: string;
  edad: number;
  cp: string | null;
  pais: string;
  estadoId: number | null;
  municipioId: number | null;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
  total: number;
  carritoBoletos: CarritoBoleto[];
  formaPagoId: number;
}

interface CarritoBoleto {
  boletoTipoId: number;
  cantidad: number;
}
