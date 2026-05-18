import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { API_CONFIG } from '../../config/api.config';
import { ReservaEvento } from '../../interfaces/registrar-evento.interface';
import { Visitante } from '../../interfaces/visitante.interface';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrarEventoService {
  // Cliente HTTP inyectado para realizar solicitudes API
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // URL base para el endpoint de reservas de eventos
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reservasEvento}`;
  private articulosUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;

  // Signal para almacenar el evento creado
  private readonly eventoResourceCreated = signal<ReservaEvento | null>(null);
  private readonly articuloResourceCreated = signal<any[]>([]);

  //Signal para el rango de fechas
  private readonly fechaRangoResource = signal<any[]>([]);
  fechaRango = this.fechaRangoResource.asReadonly();

  // signal to store the registered visitor for evento flow (independent from boleto sales)
  private readonly visitanteRegistradoResource = signal<Visitante | null>(null);
  visitanteRegistrado = this.visitanteRegistradoResource.asReadonly();

  setVisitanteRegistrado(visitante: Visitante) {
    this.visitanteRegistradoResource.set(visitante);
  }

  clearVisitanteRegistrado() {
    this.visitanteRegistradoResource.set(null);
  }

  private readonly visitorRegisteredResource = signal<boolean>(false);
  visitorRegistered = this.visitorRegisteredResource.asReadonly();

  markVisitorRegistered(value: boolean = true) {
    this.visitorRegisteredResource.set(value);
  }

  clearVisitorRegistration() {
    this.visitorRegisteredResource.set(false);
  }
  
  private readonly registroFlowResource = signal<string | null>(null);
  registroFlow = this.registroFlowResource.asReadonly();

  setRegistroFlow(flow: string | null) {
    this.registroFlowResource.set(flow);
  }

  clearRegistroFlow() {
    this.registroFlowResource.set(null);
  }
  // Signal para actualizar eventos
  private readonly eventosResourceUpdated = signal<ReservaEvento | null>(null);
  eventosActualizadosSignal = this.eventosResourceUpdated.asReadonly();

  // Signal público para acceder al evento creado
  eventoCreado = this.eventoResourceCreated.asReadonly();
  articuloCreado = this.articuloResourceCreated.asReadonly();

  // Método para registrar un nuevo evento
  registrarEvento(reservaEvento: ReservaEvento): void {
    this.eventoResourceCreated.set(null);
    this.http.post<Response<ReservaEvento | null>>(this.apiUrl, reservaEvento).subscribe({
      next: (res) => {
        if (res.data) {
          this.eventoResourceCreated.set(res.data);

          const actual = this.fechaRangoResource();

          this.fechaRangoResource.set([...actual, res.data]);
        }
        this.toast.showSuccess(res.message || 'Evento registrado correctamente');
      },
      error: (error) => {
        console.error('Error al registrar evento:', error.error);
        this.eventoResourceCreated.set(null);
        this.toast.showError(error.error?.message || 'Error al registrar evento');
      },
    });
  }

  cargarRangoFechas(museoId: number, fechaInicio: string, fechaFin: string): void {
    this.http.get<Response<any[]>>(`${this.apiUrl}/rango-fechas?museoId=${museoId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`).subscribe({
      next: (res) => {
        // console.log('Rango de fechas cargado:', res);
        this.fechaRangoResource.set(res.data || []);
      },
      error: (error) => {
        console.error('Error al cargar rango de fechas:', error);
        this.fechaRangoResource.set([]);
        this.toast.showError(error.error?.message || 'Error al cargar rango de fechas');
      },
    });
  }

  actualizarEventos(id: number, payload: Partial<ReservaEvento>): void {
    this.eventosResourceUpdated.set(null);

    const url = `${this.apiUrl}/${id}`;

    this.http.put<Response<ReservaEvento | null>>(url, payload).subscribe({
      next: (res) => {
        if (res.data) {
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();
          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );
          this.fechaRangoResource.set(actualizado);
        }
        this.toast.showSuccess(res.message || 'Evento actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar evento:', error);
        this.eventosResourceUpdated.set(null);
        this.toast.showError(error.error?.message || 'Error al actualizar evento');
      },
    });
  }

  marcarAsistido(id: number) {
    this.eventosResourceUpdated.set(null);
    this.http.post<Response<ReservaEvento | null>>(`${this.apiUrl}/${id}/asistido`, {}).subscribe({
      next: (res) => {
        if (res.data){
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();

          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );

          this.fechaRangoResource.set(actualizado);
        }

        this.toast.showSuccess(res.message || 'Evento marcado como asistido');
      },
      error: (error) => {
        console.error('Error al marcar evento como asistido:', error);
        this.toast.showError(error.error?.message || 'Error al marcar asistido');
      },
    });
  }

  marcarCancelado(id: number) {
    this.eventosResourceUpdated.set(null);
    this.http.post<Response<ReservaEvento | null>>(`${this.apiUrl}/${id}/cancelar`, {}).subscribe({
      next: (res) => {
        if (res.data){
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();

          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );

          this.fechaRangoResource.set(actualizado);
        }

        this.toast.showSuccess(res.message || 'Evento marcado como cancelado');
      },
      error: (error) => {
        console.error('Error al marcar evento como cancelado:', error);
        this.toast.showError(error.error?.message || 'Error al marcar cancelado');
      },
    });
  }

  clearEventoCreado(): void {
    this.eventoResourceCreated.set(null);
  }

  clearEventosActualizados() {
    this.eventosResourceUpdated.set(null);
  }

  cargarServiciosPorMuseo(museoId: number): void {
    this.http.get<Response<any>>(`${this.articulosUrl}/museo/${museoId}/servicios`).subscribe({
      next: (res) => {
        this.articuloResourceCreated.set(res.data || []);
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.toast.showError(error.error?.message || 'Error al cargar servicios');
      },
    });
  }
}