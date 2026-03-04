import { BoletoTipo } from "./boleto-tipo.interface";

export interface BoletoVenta {
  id?: number;
  cantidad: number;
  subTotal: number;
  boletoEmitidoId: number;
  boletoTipoId: number;
  boleto_tipo?: BoletoTipo;
}
