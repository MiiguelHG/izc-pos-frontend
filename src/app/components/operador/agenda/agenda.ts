import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
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

interface Evento {
  title: string;
  date: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-agenda',
  imports: [FullCalendarModule, RegistrarEventoOperador, DatePipe, CommonModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css'],
})
export class AgendaOperador {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  // Estado del modal y día seleccionado
  modalAbierto = false;
  fechaSeleccionada: string | null = null;
  eventosDia: Evento[] = [];

  // Lista inicial de eventos
  eventos: Evento[] = [
    { title: 'Graduación IPN', date: '2025-11-10', start: '2025-11-10T18:00:00', end: '2025-11-10T20:00:00' },
    { title: 'Exposición de Arte', date: '2025-11-10', start: '2025-11-10T10:00:00', end: '2025-11-10T12:00:00' },
    { title: 'Taller de guitarra', date: '2025-11-10', start: '2025-11-10T16:00:00', end: '2025-11-10T18:00:00' },
    { title: 'Conferencia de Historia', date: '2025-11-12', start: '2025-11-12T14:00:00', end: '2025-11-12T16:00:00' },
    { title: 'Taller de Fotografía', date: '2025-11-15', start: '2025-11-15T08:00:00', end: '2025-11-15T10:00:00' },
    { title: 'Exposición de Ciencia', date: '2025-11-15', start: '2025-11-15T12:00:00', end: '2025-11-15T14:00:00' },
    { title: 'Exposición de Ciencia', date: '2025-11-15', start: '2025-11-15T10:00:00', end: '2025-11-15T12:00:00' },
    { title: 'Exposición de Ciencia', date: '2025-11-15', start: '2025-11-15T16:00:00', end: '2025-11-15T18:00:00' },
    { title: 'Conferencia de Tecnología', date: '2025-11-20', start: '2025-11-20T18:00:00', end: '2025-11-20T20:00:00' }
  ];

  // Mapa con conteo de eventos por día
  private conteoPorDia = new Map<string, number>();

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
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: [],
    dateClick: this.onDateClick.bind(this),
    dayCellDidMount: this.colorearDias.bind(this),
  };

  ngAfterViewInit() {
    initFlowbite(); // re-inicializa todos los modales, dropdowns, etc.
  }

  constructor(private cdr: ChangeDetectorRef, private themeService: ThemeService) {
    // Cargar eventos y generar mapa de conteos inicial
    this.calendarOptions.events = this.eventos;
    this.recomputarConteo();
  }

  // Colorear días según disponibilidad
  colorearDias(arg: any) {
    const fecha = this.formatearFecha(arg.date);
    const count = this.conteoPorDia.get(fecha) || 0;

    const color =
      count >= 4
        ? '#f87171' // rojo: lleno
        : count >= 3
        ? '#facc15' // amarillo: casi lleno
        : count > 0
        ? '#86efac' // verde: disponible
        : 'white';  // vacío

    arg.el.style.backgroundColor = color;
  }

  // Abrir modal al hacer click en un día
  onDateClick(info: any) {
    this.fechaSeleccionada = info.dateStr;
    this.eventosDia = this.eventos.filter(e => e.date === info.dateStr);
    this.modalAbierto = true;

    this.cdr.detectChanges(); // forzar actualización para mostrar modal
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  // Recalcular conteos completamente (solo al iniciar o recargar eventos)
  private recomputarConteo() {
    this.conteoPorDia.clear();
    for (const e of this.eventos) {
      const k = e.date;
      this.conteoPorDia.set(k, (this.conteoPorDia.get(k) || 0) + 1);
    }
  }

  // Incrementar conteo al agregar nuevo evento
  private incrementarConteo(e: Evento) {
    const k = e.date;
    this.conteoPorDia.set(k, (this.conteoPorDia.get(k) || 0) + 1);
  }

  // Decrementar conteo 
  // private decrementarConteo(e: Evento) {
  //   const k = e.date;
  //   const nuevo = (this.conteoPorDia.get(k) || 1) - 1;
  //   if (nuevo > 0) this.conteoPorDia.set(k, nuevo);
  //   else this.conteoPorDia.delete(k);
  // }

  // Validar horario (8:00 a 20:00)
  private validarHora(horaInicio: string): boolean {
    const [h, m] = horaInicio.split(':').map(Number);
    const inicioMin = h * 60 + m;
    const finMin = inicioMin + 120; // +2 horas
    return inicioMin >= 8 * 60 && finMin <= 20 * 60;
  }

  // Verificar solapamientos
  private haySolapamiento(fecha: string, horaInicio: string, horaFin: string): boolean {
    const inicio = new Date(`${fecha}T${horaInicio}:00`).getTime();
    const fin = new Date(`${fecha}T${horaFin}:00`).getTime();

    return this.eventos.some(e => {
      if (e.date !== fecha) return false;
      const evInicio = new Date(e.start).getTime();
      const evFin = new Date(e.end).getTime();
      return inicio < evFin && fin > evInicio; // solapan si se cruzan
    });
  }

  // Agregar evento (2 horas de duración fija)
  agregarEvento(titulo: string, fecha: string, horaInicio: string) {
    if (!this.validarHora(horaInicio)) {
      alert('Solo puedes agendar eventos entre 8:00 a.m. y 8:00 p.m.');
      return;
    }

    const [h, m] = horaInicio.split(':').map(Number);
    const totalMinutosFin = h * 60 + m + 120; // +2 horas
    const finH = Math.floor(totalMinutosFin / 60);
    const finM = totalMinutosFin % 60;
    const horaFin = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;

    if (this.haySolapamiento(fecha, horaInicio, horaFin)) {
      alert('El horario se solapa con otro evento existente.');
      return;
    }

    const nuevoEvento: Evento = {
      title: titulo,
      date: fecha,
      start: `${fecha}T${horaInicio}:00`,
      end: `${fecha}T${horaFin}:00`,
    };

    this.eventos.push(nuevoEvento);
    this.incrementarConteo(nuevoEvento); 

    // Agregar al calendario sin refrescar
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.addEvent(nuevoEvento);

    this.cerrarModal();
  }

  // Utilidad: convertir Date → YYYY-MM-DD
  private formatearFecha(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
