export interface EventoCalendario {
  id?: number;
  title: string;
  start: string;
  end: string;
  date: string;
  responsable: string;
  contactoResponsable: string;
  capacidad: number;
  state?: 'reservado' | 'cancelado' | 'asistido';
}