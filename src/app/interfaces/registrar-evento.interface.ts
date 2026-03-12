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
  formaPagoId: number;

   // antes era visitanteId; ahora se reemplaza por los campos del visitante:
  nombre: string;
  edad: number;
  cp: string;
  pais: string;
  // estadoVisitante: string;
  // municipio: string;
  cantidadHombres: number;
  cantidadMujeres: number;
  cantidadOtros: number;
}