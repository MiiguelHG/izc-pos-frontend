export interface InformeVisitante {
  fechaInicio?: string; // Formato ISO 8601, e.g., "2024-01-01"
  fechaFin?: string;    // Formato ISO 8601, e.g., "2024-01-31"
  museoId?: number | null;    // ID del museo para el cual se genera el informe
  genero?: 'hombres' | 'mujeres' | 'otros' | ''; // Género (opcional)
  cp?: string; // Código postal de procedencia (opcional)
  municipio?: string; // Municipio de procedencia (opcional)
  estado?: string; // Estado de procedencia (opcional)
  nacionalidad?: string; // Nacionalidad de procedencia (opcional)
  edadMin?: number | null;   // Edad mínima (opcional)
  edadMax?: number | null;   // Edad máxima (opcional)
}
