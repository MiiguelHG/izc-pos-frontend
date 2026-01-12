import { ProductoDetalle } from './producto-detalle.interface';

export interface ProductoVenta {
  id: number;
  fechaVenta: string;
  total: number;
  formaPagoId: number;
  usuarioId: number;
  museoId: number;

  
  producto_detalles?: ProductoDetalle[];
}
