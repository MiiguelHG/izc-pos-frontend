export interface InformeIngresos {
  fechaInicio?: string; // Formato ISO 8601, e.g., "2024-01-01"
  fechaFin?: string;    // Formato ISO 8601, e.g., "2024-01-31"
  museoId?: number | null;    // ID del museo para el cual se genera el informe
  formaPagoId?: number | null; // ID de la forma de pago para filtrar el informe
  tipo?: 'boletos' | 'productos' | 'eventos'; // Tipo de ingreso a reportar
}
