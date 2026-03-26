export interface Articulo {
  id?: number;
  nombre: string;
  descripcion: string;
  precioEstandar: number;
  tipo: 'producto' | 'servicio' | 'boleto';
  habilitado?: boolean;
}