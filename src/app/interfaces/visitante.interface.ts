export interface Visitante {
  id?: number;
  nombre: string;
  edad: number;
  cp: number | null;
  pais: string;
  estado: string | null;
  municipio: string  | null;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
  totalVisitantes?: number;
  fechaRegistro?: string;
  museoId: number;
  usuarioId: number;
}