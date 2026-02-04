import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';

@Component({
  selector: 'app-usuarios-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-edit.html',
  styleUrl: './usuarios-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosEdit {
  private formBuilder = inject(FormBuilder);

  readonly usuario = input<{
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    museo: string;
    activo: boolean;
  }>();

  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['', Validators.required],
    museo: ['', Validators.required],
    activo: [true, Validators.required],
  });

  protected readonly modalId = computed(() => `edit-usuario-modal-${this.usuario()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    museo: string;
    activo: boolean;
  }>();

  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      const usuarioData = this.usuario();
      if (usuarioData) {
        this.usuarioForm.patchValue({
          nombre: usuarioData.nombre,
          correo: usuarioData.correo,
          rol: usuarioData.rol,
          museo: usuarioData.museo,
          activo: usuarioData.activo,
        });
      }
    });
  }

  onClickAgree() {
    if (this.usuarioForm.valid) {
      const usuarioData = this.usuario();
      const formData = this.usuarioForm.value;
      
      this.agreeToUpdate.emit({
        id: usuarioData!.id,
        nombre: formData.nombre!,
        correo: formData.correo!,
        rol: formData.rol!,
        museo: formData.museo!,
        activo: formData.activo!,
      });
    }
  }
}
