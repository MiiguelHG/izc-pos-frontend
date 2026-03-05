import { Ubicacion } from "./ubicacion.interface";

export interface Museo {
  id?: number;
  nombre: string;
  ubicacionId?: number;
  ubicacion?: Ubicacion;
}