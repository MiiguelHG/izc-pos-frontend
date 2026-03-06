import { Component, ViewChild, ChangeDetectorRef, inject, effect, signal, computed } from '@angular/core';
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
import { ActualizarEvento } from '../actualizar-evento/actualizar-evento';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agenda',
  imports: [FullCalendarModule, RegistrarEventoOperador, DatePipe, CommonModule, ActualizarEvento, RouterModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css'],
})

export class AgendaOperador {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private cdr = inject(ChangeDetectorRef);
  protected themeService = inject(ThemeService);
  private registrarEventoService = inject(RegistrarEventoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected readonly isChildRouteActive = signal(false);

  // Estado del modal y día seleccionado
  modalAbierto = false;
  fechaSeleccionada: string | null = null;
  eventos: EventoCalendario[] = [];
  eventosDia: EventoCalendario[] = [];

  mostrarModalEditar = false;
  mostrarModalCancelar = false;
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
        this.eventosDia = this.eventosFiltrados()
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

      // Recargar desde backend el rango visible actual
      this.registrarEventoService.cargarRangoFechas(
        this.museoId,
        view.activeStart.toISOString().substring(0, 10),
        view.activeEnd.toISOString().substring(0, 10)
      );
    });

    this.updateChildRouteState();
    this.router.events.subscribe(() => {
      this.updateChildRouteState();
    });

    effect(() => {
      const fecha = this.fechaSeleccionada;
      // const showA = this.mostrarAsistidos();
      // const showC = this.mostrarCancelados();
      // const data = this.reservas();

      if (!fecha) {
        this.eventosDia = [];
        return;
      }

      this.eventosDia = this.eventosFiltrados()
        .filter(e => e.date === fecha)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    });

  }

  // Abrir formulario de registro
  abrirFormularioRegistro() {
    console.log('abrirFormularioRegistro called');
    this.modalAbierto = false;
  }

  private updateChildRouteState(): void {
    this.isChildRouteActive.set(this.route.firstChild !== null);
  }

  // Editar evento 
  editarEvento(evento: EventoCalendario) {
    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();
    
    if (!evento.id) return;

    console.log('EDITANDO ID =>', evento.id);

    this.eventoEditarId = evento.id;

    this.mostrarModalEditar = true;
  }

  // Eliminar evento localmente
  confirmCancelModalOpen = signal(false);
  eventoParaCancelar: EventoCalendario | null = null;

  solicitarCancelar(evento: EventoCalendario) {
    this.eventoParaCancelar = evento;
    this.confirmCancelModalOpen.set(true);
  }

  confirmarCancelar() {
    if (this.eventoParaCancelar) {
      const id = this.eventoParaCancelar.id;
      this.eventos = this.eventos.map(e =>
        e.id === id ? { ...e, state: 'cancelado' } : e
      );

      // recalcular eventosDia para que el cambio se refleje inmediatamente en el modal si el evento pertenece al día mostrado
      if (this.fechaSeleccionada) {
        this.eventosDia = this.eventosFiltrados()
          .filter(e => e.date === this.fechaSeleccionada)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      }
      this.recomputarOcupacion();
      this.recolorearCalendario();

      const api = this.calendarComponent?.getApi();
      if (api) {
        api.removeAllEvents();
        api.addEventSource(this.eventos as any);
        api.render();
      }

      this.registrarEventoService.clearEventosActualizados();
      this.registrarEventoService.clearMensaje();
      console.log('CANCELANDO ID =>', id);
      this.registrarEventoService.marcarCancelado(id!);
    }
    this.confirmCancelModalOpen.set(false);
    this.eventoParaCancelar = null;
  }

  cancelarCancelacion() {
    this.confirmCancelModalOpen.set(false);
    this.eventoParaCancelar = null;
  }

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
    const MAX = 24 * 30;

    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
      const date = cell.getAttribute('data-date');
      if (!date) return;

      const minutos = this.minutosPorDia.get(date) || 0;
      const pct = minutos / MAX;
      
      // let color = 'white';

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
    
    this.eventosDia = this.eventosFiltrados()
      .filter(e => e.date === info.dateStr)
      .sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
    this.modalAbierto = true;

    this.cdr.detectChanges(); // forzar actualización para mostrar modal
  }

  cerrarModal() {
    this.modalAbierto = false;
    // limpiar estado para que al volver a abrir comience ocultando
    // asistidos/cancelados y no recuerde la fecha anterior.
    this.fechaSeleccionada = null;
    this.mostrarAsistidos.set(false);
    this.mostrarCancelados.set(false);
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

  private isoToLocalYMD(iso: string): string {
    const d = new Date(iso);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }

  mostrarAsistidos = signal(false);
  mostrarCancelados = signal(false);

  eventosFiltrados = computed(() => {
  
    this.reservas();

    return this.eventos.filter(e => {
      if (e.state === 'reservado') return true;
      if (e.state === 'asistido') return this.mostrarAsistidos();
      if (e.state === 'cancelado') return this.mostrarCancelados();
      return true;
    });
  });

  cerrarEditarModal() {
    this.mostrarModalEditar = false;
    this.eventoEditarId = undefined!;
  }

}

