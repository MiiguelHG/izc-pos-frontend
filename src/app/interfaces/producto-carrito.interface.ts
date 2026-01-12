import { Articulo } from './articulo.interface';

export interface ProductoCarrito extends Articulo {
  cantidad: number;
}
