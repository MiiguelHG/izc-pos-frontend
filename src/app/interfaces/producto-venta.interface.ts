import { ProductoDetalle } from './producto-detalle.interface';

export interface ProductoVenta {
  id: number;
  fechaVenta: string;
  total: number;
  formaPagoId: number;
  usuarioId: number;
  museoId: number;
  usuario?: {
    id: number;
    nombre: string;
  };
formas_pago?: {
    id: number;
    nombre: string;
  };
  
  producto_detalles?: ProductoDetalle[];
}
