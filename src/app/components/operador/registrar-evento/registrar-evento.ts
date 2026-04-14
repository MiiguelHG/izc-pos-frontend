import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-registrar-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-evento.html',
  styleUrl: './registrar-evento.css',
})
export class RegistrarEventoOperador {

  message = '';

  eventoForm = new FormGroup({
    responsable: new FormControl('', [Validators.required, Validators.minLength(3)]),
    contacto_responsable: new FormControl('', [Validators.required]),
    tipo_evento: new FormControl('', [Validators.required]),
    fecha_reserva: new FormControl('', [Validators.required]),
    fecha_inicio: new FormControl('', [Validators.required]),
    fecha_fin: new FormControl('', [Validators.required]),
    estado: new FormControl('', [Validators.required]),
    forma_pago: new FormControl('', [Validators.required]),
    total: new FormControl('', [Validators.required, Validators.min(0)]),
  });

  registrarEventoOperador() {
    if (this.eventoForm.valid) {
      const data = this.eventoForm.value;
      alert(`✅ Evento registrado para el responsable "${data.responsable}".`);
      this.eventoForm.reset();
    } else {
      this.message = '⚠️ Completa todos los campos obligatorios.';
    }
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
