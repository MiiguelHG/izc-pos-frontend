export interface Ubicacion {
  id?: number;
  calle?: string | null;
  numero?: number | null;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal?: number | null;
}
