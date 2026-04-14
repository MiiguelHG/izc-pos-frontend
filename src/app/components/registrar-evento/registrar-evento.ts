import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators, 
  ValidationErrors, 
  AbstractControl 
} from '@angular/forms';

@Component({
  selector: 'app-registrar-evento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-evento.html',
  styleUrl: './registrar-evento.css',
})

export class RegistrarEvento {
  message: string = '';

   tipos_evento = [
    {value: 'conferencia', label: 'Conferencia'},
    {value: 'taller', label: 'Taller'},
    {value: 'graduacion', label: 'Graduación'},
    {value: 'exposicion', label: 'Exposición'},
  ]

  // Formulario reactivo
  eventoForm = new FormGroup({
    nombre_evento: new FormControl('', [Validators.required, Validators.minLength(3)]),
    nombre_visitante: new FormControl('', [Validators.required, Validators.minLength(3)]),
    fecha_inicio: new FormControl('', [Validators.required]),
    fecha_fin: new FormControl('', [Validators.required]),
    hora_inicio: new FormControl('', [Validators.required]),
    hora_fin: new FormControl('', [Validators.required]),
    lugar: new FormControl('', [Validators.required]),
    capacidad: new FormControl(null, [Validators.required, Validators.min(1)]),
    costo: new FormControl(null, [Validators.required, Validators.min(0)]),
    tipo_evento: new FormControl('', [Validators.required]),
    },
    { validators: [validFechaYHora] }
  );
  registrarEvento() {
    if (this.eventoForm.valid) {
      const eventoData = this.eventoForm.value;
      alert(`✅ Evento "${eventoData.nombre_evento}" registrado exitosamente para el visitante "${eventoData.nombre_visitante}".`);
      // Aquí podrías agregar lógica para enviar los datos a un servidor o almacenarlos
      this.eventoForm.reset();
    } else {
      this.message = '⚠️ Por favor completa todos los campos obligatorios correctamente.';
    }
  }

  get tipoEventoLabel() {
    const tipoEvento = this.eventoForm.get('tipo_evento')?.value;
    const tipo = this.tipos_evento.find(t => t.value === tipoEvento);
    return tipo ? tipo.label : '';
  }

  
  onCancel(): void {
    this.eventoForm.reset();
    this.closeModal();
  }

 private closeModal(): void {
  const modal = document.getElementById('registerEventoButtonModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Flowbite inyecta el backdrop con este atributo
  document.querySelectorAll('[modal-backdrop]').forEach(el => el.remove());
  
  // A veces lo inyecta como clase en lugar de atributo
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  
  // Quitar bloqueo del scroll
  document.body.classList.remove('overflow-hidden');
  document.body.style.overflow = '';
}
}

function validFechaYHora(group: AbstractControl): ValidationErrors | null {
  const fechaInicio = group.get('fecha_inicio')?.value;
  const fechaFin = group.get('fecha_fin')?.value;
  const horaInicio = group.get('hora_inicio')?.value;
  const horaFin = group.get('hora_fin')?.value;

  if (!fechaInicio || !fechaFin || !horaInicio || !horaFin) return null;

  // Combinar fecha y hora en un solo objeto Date
  const inicio = new Date(`${fechaInicio}T${horaInicio}`);
  const fin = new Date(`${fechaFin}T${horaFin}`);

  // Validar que fin sea posterior a inicio
  if (inicio >= fin) {
    return { fechaHoraInvalida: true };
  }

  return null; //Bandera versión
}


