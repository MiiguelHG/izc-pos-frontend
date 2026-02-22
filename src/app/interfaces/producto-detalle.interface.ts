export interface ProductoDetalle {
  id: number;
  articuloId: number;
  cantidad: number;
  subTotal: number;
  productoVentaId: number;
  articulo?: {
    id: number;
    nombre: string;
  };

}
