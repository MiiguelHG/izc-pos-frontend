import { Museo } from "./museo.interface";
import { User } from "./user.interface";

export interface Invitado {
  id?: number;
  nombre: string;
  motivo: string;
  fechaExpiracion?: string;
  usado?: boolean;
  boletoEmitidoId?: number;
  usuarioId: number;
  museoId: number;
  museo?: Museo;
  usuario?: User;
}
