export interface Visitante {
  id?: number;
  nombre: string;
  edad: number;
  cp: number;
  pais: string;
  estado: string;
  municipio: string;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
  totalVisitantes?: number;
  fechaRegistro?: string;
  museoId: number;
  usuarioId: number;
}