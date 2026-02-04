import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-usuarios-create',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-create.html',
  styleUrl: './usuarios-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosCreate {
  private formBuilder = inject(FormBuilder);

  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['', Validators.required],
    museo: ['', Validators.required],
    activo: [true, Validators.required],
  });

  agreeToCreate = output<{
    nombre: string;
    correo: string;
    rol: string;
    museo: string;
    activo: boolean;
  }>();

  onClickAgree() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        correo: formData.correo!,
        rol: formData.rol!,
        museo: formData.museo!, 
        activo: formData.activo!,
      });

      this.usuarioForm.reset({ activo: true });
    }
  }
}
