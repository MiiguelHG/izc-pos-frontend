import { Estado } from "./estado.interface";
import { Municipio } from "./municipio.interface";

export interface Visitante {
  id?: number;
  nombre: string;
  edad: number;
  cp: string | null;
  pais: string;
  estadoId: number | null;
  municipioId: number | null;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
  totalVisitantes?: number;
  fechaRegistro?: string;
  museoId: number;
  usuarioId: number;
  municipio?: Municipio;
  estado?: Estado;
}

