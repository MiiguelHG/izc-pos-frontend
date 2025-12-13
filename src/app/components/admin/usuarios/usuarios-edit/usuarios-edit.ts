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
    idNumerico: string;
    correo: string;
    activo: boolean;
  }>();

  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    idNumerico: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    correo: ['', [Validators.required, Validators.email]],
    activo: [true, Validators.required],
  });

  protected readonly modalId = computed(() => `edit-usuario-modal-${this.usuario()?.id}`);

  agreeToUpdate = output<{
    id: number;
    nombre: string;
    idNumerico: string;
    correo: string;
    activo: boolean;
  }>();

  constructor() {
    afterNextRender(() => initModals());

    effect(() => {
      const usuarioData = this.usuario();
      if (usuarioData) {
        this.usuarioForm.patchValue({
          nombre: usuarioData.nombre,
          idNumerico: usuarioData.idNumerico,
          correo: usuarioData.correo,
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
        idNumerico: formData.idNumerico!,
        correo: formData.correo!,
        activo: formData.activo!,
      });
    }
  }
}
