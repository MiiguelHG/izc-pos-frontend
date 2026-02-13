export interface ReservaEvento {
  id?: number;

  nombreEvento: string;
  responsable: string;
  contactoResponsable: string;
  capacidad: number;

  fechaInicio: string;
  fechaFin: string;

  total: number;
  estado: 'reservado' | 'cancelado' | 'asistido';

  usuarioId: number;
  museoId: number;
  articuloId: number;
  visitanteId: number;
  formaPagoId: number;
}