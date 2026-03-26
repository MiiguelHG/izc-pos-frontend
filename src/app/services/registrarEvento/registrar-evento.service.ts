import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Response } from '../../interfaces/response.interface';
import { API_CONFIG } from '../../config/api.config';
import { ReservaEvento } from '../../interfaces/registrar-evento.interface';
import { Visitante } from '../../interfaces/visitante.interface';
import { Museo } from '../../interfaces/museo.interface';
import { Observable, map } from 'rxjs';
import { MuseosResponse } from '../../interfaces/museosResponse.interface'; 

@Injectable({
  providedIn: 'root',
})
export class RegistrarEventoService {
  // Cliente HTTP inyectado para realizar solicitudes API
  private http = inject(HttpClient);

  // URL base para el endpoint de reservas de eventos
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reservasEvento}`;
  private articulosUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articulos}`;
  private fomasPagoUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.formaPago}`;
  private museosUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.museos}`;

  // Signal para almacenar el evento creado
  private readonly eventoResourceCreated = signal<ReservaEvento | null>(null);
  private readonly articuloResourceCreated = signal<any[]>([]);
  private readonly formaPagoResourceCreated = signal<any[]>([]);
  private readonly mensajeResourceCreated = signal<string>('');

  museoSeleccionado = signal<number | null>(null);
  setMuseoSeleccionado(id: number | null) {
    this.museoSeleccionado.set(id);
  }

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
  formaPagoCreada = this.formaPagoResourceCreated.asReadonly();
  mensajeCreado = this.mensajeResourceCreated.asReadonly();

  // Método para registrar un nuevo evento
  registrarEvento(reservaEvento: ReservaEvento): void {
    this.eventoResourceCreated.set(null);
    this.mensajeResourceCreated.set('');
    this.http.post<Response<ReservaEvento | null>>(this.apiUrl, reservaEvento).subscribe({
      next: (res) => {
        console.log('Evento registrado:', res);
        // Actualizar el signal con el evento creado si la respuesta es exitosa y contiene datos
        // res.data && this.eventoResourceCreated.set(res.data);
        if (res.data) {
          this.eventoResourceCreated.set(res.data);

          const actual = this.fechaRangoResource();

          this.fechaRangoResource.set([...actual, res.data]);
        }

        this.mensajeResourceCreated.set(res.message);
      },
      error: (error) => {
        console.error('Error al registrar evento:', error.error);
        this.eventoResourceCreated.set(null);
        this.mensajeResourceCreated.set(error.error?.message);
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
      },
    });
  }

  actualizarEventos(id: number, payload: Partial<ReservaEvento>): void {
    this.eventosResourceUpdated.set(null);

    const url = `${this.apiUrl}/${id}`;

    this.http.put<Response<ReservaEvento | null>>(url, payload).subscribe({
      next: (res) => {
        console.log('Evento actualizado:', res);
        if (res.data) {
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();
          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );
          this.fechaRangoResource.set(actualizado);
        }
        this.mensajeResourceCreated.set(res.message);
      },
      error: (error) => {
        console.error('Error al actualizar evento:', error);
        this.eventosResourceUpdated.set(null);
        this.mensajeResourceCreated.set(error.error?.message);
      },
    });
  }

  marcarAsistido(id: number) {
    this.eventosResourceUpdated.set(null);
    this.http.post<Response<ReservaEvento | null>>(`${this.apiUrl}/${id}/asistido`, {}).subscribe({
      next: (res) => {
        console.log('Evento marcado como asistido:', res);

        if (res.data){
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();

          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );

          this.fechaRangoResource.set(actualizado);
        }

        this.mensajeResourceCreated.set(res.message);
      },
      error: (error) => {
        console.error('Error al marcar evento como asistido:', error);
        this.mensajeResourceCreated.set(error.error?.message);
      },
    });
  }

  marcarCancelado(id: number) {
    this.eventosResourceUpdated.set(null);
    this.http.post<Response<ReservaEvento | null>>(`${this.apiUrl}/${id}/cancelar`, {}).subscribe({
      next: (res) => {
        console.log('Evento marcado como cancelado:', res);

        if (res.data){
          this.eventosResourceUpdated.set(res.data);

          const actual = this.fechaRangoResource();

          const actualizado = actual.map(e =>
            e.id === res.data!.id ? res.data : e
          );

          this.fechaRangoResource.set(actualizado);
        }

        this.mensajeResourceCreated.set(res.message);
      },
      error: (error) => {
        console.error('Error al marcar evento como cancelado:', error);
        this.mensajeResourceCreated.set(error.error?.message);
      },
    });
  }

  clearEventoCreado(): void {
    this.eventoResourceCreated.set(null);
    this.mensajeResourceCreated.set('');
  }

  clearEventosActualizados() {
    this.eventosResourceUpdated.set(null);
  }

  clearMensaje() {
    this.mensajeResourceCreated.set('');
  }

  cargarServiciosPorMuseo(museoId: number): void {
    console.log('SERVICE → cargarServiciosPorMuseo', museoId);
    this.http.get<Response<any>>(`${this.articulosUrl}/museo/${museoId}/servicios`).subscribe({
      next: (res) => {
        console.log('Servicios cargados:', res);
        this.articuloResourceCreated.set(res.data || []);
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      },
    });
  }

  // Get para las formas de pago
  cargarFormasPago(): void {
    this.http.get<Response<any>>(this.fomasPagoUrl).subscribe({
      next: res => {
        // console.log('Formas de pago cargadas:', res);
        this.formaPagoResourceCreated.set(res.data);
      },
      error: err => console.error('Error formas pago:', err),
    });
  }


  readonly allMuseos = signal<Response<Museo[] | null> | null>(null);

  // Metodo temporar que despues será eliminado *************************
  getAllMuseos(): Observable<Museo[]> {
    return this.http.get<MuseosResponse>(this.museosUrl)
      .pipe(
        map(res => res.data.data)
      );
  }

}