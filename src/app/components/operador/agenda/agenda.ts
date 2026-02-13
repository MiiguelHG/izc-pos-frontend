import { Component, ViewChild, ChangeDetectorRef, inject, effect } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { RegistrarEventoOperador } from '../registrar-evento/registrar-evento';
import { initFlowbite } from 'flowbite';
import { CommonModule, DatePipe } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import esLocale from '@fullcalendar/core/locales/es';
import { EventoCalendario } from '../../../interfaces/evento-calendario';
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { ActualizarEvento } from "../actualizar-evento/actualizar-evento";
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-agenda',
  imports: [FullCalendarModule, RegistrarEventoOperador, DatePipe, CommonModule, ActualizarEvento],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css'],
})

export class AgendaOperador {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private cdr = inject(ChangeDetectorRef);
  protected themeService = inject(ThemeService);
  private registrarEventoService = inject(RegistrarEventoService);
  private authService = inject(AuthService);

  // Estado del modal y día seleccionado
  modalAbierto = false;
  fechaSeleccionada: string | null = null;
  eventos: EventoCalendario[] = [];
  eventosDia: EventoCalendario[] = [];

  mostrarModalEditar = false;
  eventoEditarId!: number;

  reservas = this.registrarEventoService.fechaRango;

  museoId: number | null = null;

  // Mapa con conteo de eventos por día
  private minutosPorDia = new Map<string, number>();

  // --- OPCIONES DEL CALENDARIO ---
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
    initialView: 'dayGridMonth',
    selectable: true,
    editable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth',
    },
    events: [],
    dateClick: this.onDateClick.bind(this),
    datesSet: (arg) => {
      if (!this.museoId) return;
      this.registrarEventoService.cargarRangoFechas(
        this.museoId!,
        arg.startStr.substring(0, 10),
        arg.endStr.substring(0, 10)
      );
    },
  };

  ngAfterViewInit() {
    initFlowbite(); // re-inicializa todos los modales, dropdowns, etc.

    const user = this.authService.user();
    this.museoId = user?.museoId || null;
    const api = this.calendarComponent.getApi();
    const view = api.view;

    this.registrarEventoService.cargarRangoFechas(
      this.museoId!,
      view.activeStart.toISOString().substring(0, 10),
      view.activeEnd.toISOString().substring(0, 10)
    );
  }

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      const api = this.calendarComponent?.getApi();
      if (!api) return;
      api.setOption('themeSystem', isDark ? 'dark' : 'standard');
    });

    effect(() => {
      const data = this.reservas();

      console.log('Reservas rango:', data);

      const eventos = data.map(e => ({
        id: e.id,
        title: e.nombreEvento,
        start: e.fechaInicio,
        end: e.fechaFin,
        date: this.isoToLocalYMD(e.fechaInicio),
        responsable: e.responsable,
        contactoResponsable: e.contactoResponsable,
        capacidad: e.capacidad,
        state: e.estado,
      }));

      this.eventos = eventos;

      if (this.fechaSeleccionada) {
        this.eventosDia = this.eventos
          .filter(e => e.date === this.fechaSeleccionada)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      }

      this.recomputarOcupacion();
      this.recolorearCalendario();

      const api = this.calendarComponent?.getApi();
      if (!api) return;

      api.removeAllEvents();
      api.addEventSource(eventos as any);
      api.render();

      this.cdr.detectChanges();
    });

    effect(() => {
      const eventoActualizado = this.registrarEventoService.eventosActualizadosSignal();

      if (!eventoActualizado) return;

      const api = this.calendarComponent?.getApi();
      if (!api || !this.museoId) return;

      const view = api.view;

      // 🔥 Recargar desde backend el rango visible actual
      this.registrarEventoService.cargarRangoFechas(
        this.museoId,
        view.activeStart.toISOString().substring(0, 10),
        view.activeEnd.toISOString().substring(0, 10)
      );
    });

  }

  // Abrir formulario de registro (stub) — can be expanded to actually open RegistrarEventoOperador
  abrirFormularioRegistro() {
    console.log('abrirFormularioRegistro called');
    this.modalAbierto = false;
  }

  // Editar evento (stub) — open editor or populate form in a future iteration
  editarEvento(evento: EventoCalendario) {
    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();
    
    if (!evento.id) return;

    console.log('EDITANDO ID =>', evento.id);

    this.eventoEditarId = evento.id;

    this.mostrarModalEditar = true;
  }

  // Eliminar evento localmente (stub). Does not call backend; adjust when delete API exists.
    cancelarEvento(evento: EventoCalendario) {
    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();

    if (!evento.id) return;

    console.log('CANCELANDO ID =>', evento.id);
    this.registrarEventoService.marcarCancelado(evento.id);
  }

  eventoAsistido(evento: EventoCalendario) {
    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();

    if (!evento.id) return;

    console.log('ASISTIDO ID =>', evento.id);
    this.registrarEventoService.marcarAsistido(evento.id);
  }

  private recolorearCalendario() {
    const MAX = 12 * 60;

    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
      const date = cell.getAttribute('data-date');
      if (!date) return;

      const minutos = this.minutosPorDia.get(date) || 0;
      const pct = minutos / MAX;
      
      let color = 'white';

      
      cell.classList.remove('ocupacion-baja', 'ocupacion-media', 'ocupacion-alta', 'ocupacion-full', 'ocupacion-dark');

      if (pct > 0.9) cell.classList.add('ocupacion-full');
      else if (pct > 0.6) cell.classList.add('ocupacion-alta');
      else if (pct > 0.25) cell.classList.add('ocupacion-media');
      else if (pct > 0) cell.classList.add('ocupacion-baja');
    });
  }

  // Abrir modal al hacer click en un día
  onDateClick(info: any) {
    this.fechaSeleccionada = info.dateStr;
    this.eventosDia = this.eventos
    .filter(e => e.date === info.dateStr)
    .sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
    this.modalAbierto = true;

    this.cdr.detectChanges(); // forzar actualización para mostrar modal
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  // Recalcular conteos completamente (solo al iniciar o recargar eventos)
  recomputarOcupacion() {
    this.minutosPorDia.clear();
    for (const e of this.eventos){
      const star = new Date(e.start);
      const end = new Date(e.end);

      const minutos = (end.getTime() - star.getTime()) / 60000;

      const fecha = this.isoToLocalYMD(e.start);

      this.minutosPorDia.set(fecha, (this.minutosPorDia.get(fecha) || 0) + minutos);
    }
  }

  // Utilidad: convertir Date → YYYY-MM-DD
  private formatearFecha(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private isoToLocalYMD(iso: string): string {
    const d = new Date(iso);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }

  cerrarEditarModal() {
    this.mostrarModalEditar = false;
    this.eventoEditarId = undefined!;
  }

}

