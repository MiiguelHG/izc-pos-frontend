export interface EmitirProductoVenta {
  total: number;
  carritoProductos: CarritoProducto[];
  museoId: number;
  usuarioId: number;
  formaPagoId: number;
}

interface CarritoProducto {
  articuloId: number;
  cantidad: number;
}
