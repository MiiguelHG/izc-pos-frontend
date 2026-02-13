import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservaEvento } from '../../interfaces/registrar-evento.interface';

@Component({
  selector: 'app-evento-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './evento-form.html',
  styleUrl: './evento-form.css',
})

export class EventoForm {
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() set evento(value: ReservaEvento | null){
    if (value){
      this.cargarDatosEvento(value);
    }
  }

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  constructor(){
    
  }

  eventoForm = this.fb.group({
    nombreEvento: new FormControl('', [Validators.required, Validators.minLength(3)]),
    responsable: new FormControl('', [Validators.required, Validators.minLength(3)]),
    contactoResponsable: new FormControl('', [Validators.required]),
    
    articuloId: new FormControl< number | null>(null, [Validators.required]),

    fecha_inicio: new FormControl('', [Validators.required]),
    fecha_fin: new FormControl('', [Validators.required]),

    hora_inicio: new FormControl('', [Validators.required]),
    hora_fin: new FormControl('', [Validators.required]),

    estado: new FormControl<'reservado' | 'cancelado' | 'asistido'>('reservado', [Validators.required]),
    formaPagoId: new FormControl< number | null>(null, [Validators.required]),

    total: new FormControl<number>({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
  });

  message = '';

  private cargarDatosEvento(evento: ReservaEvento) {
    this.eventoForm.patchValue({
      nombreEvento: evento.nombreEvento,
      responsable: evento.responsable,
      contactoResponsable: evento.contactoResponsable,
      articuloId: evento.articuloId,
      formaPagoId: evento.formaPagoId,
      estado: evento.estado,

      fecha_inicio: this.formatFecha(evento.fechaInicio),
      fecha_fin: this.formatFecha(evento.fechaFin),
      hora_inicio: this.formatHora(evento.fechaInicio),
      hora_fin: this.formatHora(evento.fechaFin),

      total: evento.total
    });
  }

  private formatFecha(fechaIso: string) {
    return fechaIso.split('T')[0];
  }

  private formatHora(fechaIso: string) {
    return fechaIso.substring(11, 16);
  }

  submit() {
    if (this.eventoForm.invalid) return;

    this.formSubmit.emit(this.eventoForm.value as ReservaEvento);
  }

  cancelarClick() {
    this.cancelar.emit();
  }

}