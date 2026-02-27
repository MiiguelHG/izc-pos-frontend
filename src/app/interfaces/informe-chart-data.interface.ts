export interface InformeChartData {
  count: number;
  data: {
    fechaRegistro: string; // Formato ISO 8601, e.g., "2024-01-01T00:00:00Z"
    total: number;
  }[];
}
