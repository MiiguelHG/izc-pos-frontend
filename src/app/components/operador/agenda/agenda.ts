import { Component, ViewChild, ChangeDetectorRef, DestroyRef, inject, effect, signal, computed } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { RegistrarEventoOperador } from '../registrar-evento/registrar-evento';
import { CommonModule, DatePipe } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import esLocale from '@fullcalendar/core/locales/es';
import { EventoCalendario } from '../../../interfaces/evento-calendario';
import { RegistrarEventoService } from '../../../services/registrarEvento/registrar-evento.service';
import { ActualizarEvento } from '../actualizar-evento/actualizar-evento';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SelectMuseos } from '../../../services/select-museos/select-museos.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-agenda',
  imports: [FullCalendarModule, RegistrarEventoOperador, DatePipe, CommonModule, ActualizarEvento, RouterModule, ReactiveFormsModule],
  providers: [RegistrarEventoService],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css'],
})

export class AgendaOperador {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected themeService = inject(ThemeService);
  public registrarEventoService = inject(RegistrarEventoService);
  private selectMuseosService = inject(SelectMuseos);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected readonly isChildRouteActive = signal(false);

  modalAbierto = false;
  fechaSeleccionada: string | null = null;

  eventos = signal<EventoCalendario[]>([]);
  eventosDia = signal<EventoCalendario[]>([]);
  museos = this.selectMuseosService.museos;

  mostrarModalEditar = false;
  mostrarModalCancelar = false;
  eventoEditarId!: number;

  reservas = this.registrarEventoService.fechaRango; 
  currentMuseo = new FormControl<number | null>(null);

  private minutosPorDia = new Map<string, number>();

  esAdmin = computed(() => {
    const user = this.authService.user();
    return user?.rol?.nombre === 'admin';
  });

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
      if (!this.currentMuseo.value) return;
      this.registrarEventoService.cargarRangoFechas(
        this.currentMuseo.value!,
        arg.startStr.substring(0, 10),
        arg.endStr.substring(0, 10)
      );
    },
  };

 ngAfterViewInit() {
    const user = this.authService.user();
    if (!user) return;

    // ADMIN → cargar museos
    if (this.esAdmin()) {
      const museoActual = this.currentMuseo.value;

      // SOLO seleccionar el primero si no hay museo seleccionado
      const museosValue = this.museos.value();
      if (!museoActual && museosValue?.data?.length) {
        this.currentMuseo.patchValue(museosValue.data[0].id ?? null);
      }

      this.currentMuseo.valueChanges
        .pipe(
          startWith(this.currentMuseo.value),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(museo => {
          this.cargarReservasDelMuseo(museo);
        });
    }
    else {
      // OPERADOR → siempre su museo
      this.currentMuseo.patchValue(user.museoId);

      this.currentMuseo.valueChanges
        .pipe(
          startWith(this.currentMuseo.value),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(museo => {
          this.cargarReservasDelMuseo(museo);
        });
    }
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

      const eventos: EventoCalendario[] = data.map((e: any) => ({
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

      this.eventos.set(eventos);

      if (this.fechaSeleccionada) {

        const eventosFiltrados = this.eventosFiltrados(); // FIX

        this.eventosDia.set(
          eventosFiltrados
            .filter((e: EventoCalendario) => e.date === this.fechaSeleccionada)
            .sort((a: EventoCalendario, b: EventoCalendario) =>
              new Date(a.start).getTime() - new Date(b.start).getTime()
            )
        );
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
      if (!api || !this.currentMuseo.value) return;

      const view = api.view;

      this.registrarEventoService.cargarRangoFechas(
        this.currentMuseo.value,

        view.activeStart.toISOString().substring(0, 10),
        view.activeEnd.toISOString().substring(0, 10)
      );
    });

    this.updateChildRouteState();
    this.router.events.subscribe(() => {
      this.updateChildRouteState();
    });

    // FIX IMPORTANTE: reaccionar a checkboxes
    effect(() => {

      const fecha = this.fechaSeleccionada;
      const eventos = this.eventosFiltrados(); // depende de los signals

      if (!fecha) {
        this.eventosDia.set([]);
        return;
      }

      this.eventosDia.set(
        eventos
          .filter((e: EventoCalendario) => e.date === fecha)
          .sort((a: EventoCalendario, b: EventoCalendario) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
          )
      );

    });
  }

  private cargarReservasDelMuseo(museo: number | null): void {
    if (!museo) return;

    const api = this.calendarComponent?.getApi();
    if (!api) return;

    const view = api.view;

    this.cargarReservas(
      museo,
      view.activeStart.toISOString().substring(0, 10),
      view.activeEnd.toISOString().substring(0, 10)
    );
  }

  cargarReservas(museoId: number, start: string, end: string) {
    this.registrarEventoService.cargarRangoFechas(
      museoId,
      start,
      end
    );
  }

  abrirFormularioRegistro() {
    this.modalAbierto = false;
  }

  private updateChildRouteState(): void {
    this.isChildRouteActive.set(this.route.firstChild !== null);
  }

  editarEvento(evento: EventoCalendario) {

    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();

    if (!evento.id) return;

    this.eventoEditarId = evento.id;
    this.mostrarModalEditar = true;
  }

  confirmCancelModalOpen = signal(false);
  eventoParaCancelar: EventoCalendario | null = null;

  solicitarCancelar(evento: EventoCalendario) {
    this.eventoParaCancelar = evento;
    this.confirmCancelModalOpen.set(true);
  }

  confirmarCancelar() {

    if (this.eventoParaCancelar) {

      const id = this.eventoParaCancelar.id;

      this.eventos.update(eventos =>
        eventos.map(e => e.id === id ? { ...e, state: 'cancelado' } : e)
      );

      if (this.fechaSeleccionada) {

        const eventos = this.eventosFiltrados();

        this.eventosDia.set(
          eventos
            .filter((e: EventoCalendario) => e.date === this.fechaSeleccionada)
            .sort((a: EventoCalendario, b: EventoCalendario) =>
              new Date(a.start).getTime() - new Date(b.start).getTime()
            )
        );
      }

      this.recomputarOcupacion();
      this.recolorearCalendario();

      const api = this.calendarComponent?.getApi();

      if (api) {
        api.removeAllEvents();
        api.addEventSource(this.eventos() as any); // FIX
        api.render();
      }

      this.registrarEventoService.clearEventosActualizados();
      this.registrarEventoService.clearMensaje();
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

    this.eventos.update(eventos =>
      eventos.map(e => e.id === evento.id ? { ...e, state: 'cancelado' } : e)
    );

    this.registrarEventoService.marcarCancelado(evento.id);
  }

  eventoAsistido(evento: EventoCalendario) {

    this.registrarEventoService.clearEventosActualizados();
    this.registrarEventoService.clearMensaje();

    if (!evento.id) return;

    this.eventos.update(eventos =>
      eventos.map(e => e.id === evento.id ? { ...e, state: 'asistido' } : e)
    );

    this.registrarEventoService.marcarAsistido(evento.id);
  }

  private recolorearCalendario() {

    const MAX = 24 * 30;

    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {

      const date = cell.getAttribute('data-date');
      if (!date) return;

      const minutos = this.minutosPorDia.get(date) || 0;
      const pct = minutos / MAX;

      cell.classList.remove(
        'ocupacion-baja',
        'ocupacion-media',
        'ocupacion-alta',
        'ocupacion-full',
        'ocupacion-dark'
      );

      if (pct > 0.9) cell.classList.add('ocupacion-full');
      else if (pct > 0.6) cell.classList.add('ocupacion-alta');
      else if (pct > 0.25) cell.classList.add('ocupacion-media');
      else if (pct > 0) cell.classList.add('ocupacion-baja');

    });

  }

  onDateClick(info: any) {

    this.fechaSeleccionada = info.dateStr;

    const eventos = this.eventosFiltrados();

    this.eventosDia.set(
      eventos
        .filter((e: EventoCalendario) => e.date === this.fechaSeleccionada)
        .sort((a: EventoCalendario, b: EventoCalendario) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
        )
    );

    this.modalAbierto = true;

    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.fechaSeleccionada = null;
  }

  recomputarOcupacion() {

    this.minutosPorDia.clear();

    for (const e of this.eventos()) { // FIX

      if (e.state === 'cancelado') continue;

      const star = new Date(e.start);
      const end = new Date(e.end);

      const minutos = (end.getTime() - star.getTime()) / 60000;

      const fecha = this.isoToLocalYMD(e.start);

      this.minutosPorDia.set(
        fecha,
        (this.minutosPorDia.get(fecha) || 0) + minutos
      );

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

  eventosFiltrados = computed<EventoCalendario[]>(() => {

    return this.eventos().filter((e: EventoCalendario) => { // FIX
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
