import { BoletoVenta } from "./boleto-venta.interface";
import { FormaPago } from "./forma-pago.interface";
import { Museo } from "./museo.interface";
import { User } from "./user.interface";
import { Visitante } from "./visitante.interface";

export interface BoletoEmitidoInfo {
  fechaEmision: string;
  id: number;
  total: number;
  usuarioId: number;
  museoId: number;
  visitanteId: number;
  formaPagoId: number;
  boleto_ventas?: BoletoVenta[];
  visitante: Visitante;
  museo?: Museo;
  usuario?: User;
  formas_pago?: FormaPago;
}


