export interface EmitirBoleto {
  nombre: string;
  edad: number;
  cp: number;
  pais: string;
  estado: string;
  municipio: string;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
  total: number;
  carritoBoletos: CarritoBoleto[];
  usuarioId: number;
  museoId: number;
  formaPagoId: number;
}

interface CarritoBoleto {
  boletoTipoId: number;
  cantidad: number;
}
