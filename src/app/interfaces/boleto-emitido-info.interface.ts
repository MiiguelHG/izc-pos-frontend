import { BoletoVenta } from "./boleto-venta.interface";
import { Museo } from "./museo.interface";
import { Visitante } from "./visitante.interface";

export interface BoletoEmitidoInfo {
  fechaEmision: string;
  estado: string;
  id: number;
  total: number;
  usuarioId: number;
  museoId: number;
  visitanteId: number;
  formaPagoId: number;
  boleto_ventas: BoletoVenta[];
  visitante: Visitante;
  museo: Museo;
}


