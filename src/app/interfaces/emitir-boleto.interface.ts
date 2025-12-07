export interface EmitirBoleto {
  total: number;
  carritoBoletos: CarritoBoleto[];
  usuarioId: number;
  museoId: number;
  visitanteId: number;
  formaPagoId: number;
}

interface CarritoBoleto {
  boletoTipoId: number;
  cantidad: number;
}

