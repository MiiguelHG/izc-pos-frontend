import { ResumenInforme } from "./informe-resumen.interface";

export interface InformeChartData {
  resumen: ResumenInforme;
  data: Registro[];
}

interface Registro {
  fecha: string; // Formato ISO 8601, e.g., "2024-01-01T00:00:00Z"
  total: number;
}
