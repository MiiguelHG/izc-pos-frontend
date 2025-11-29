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
    idNumerico: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    correo: ['', [Validators.required, Validators.email]],
    activo: [true, Validators.required],
  });

  agreeToCreate = output<{
    nombre: string;
    idNumerico: string;
    correo: string;
    activo: boolean;
  }>();

  onClickAgree() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        idNumerico: formData.idNumerico!,
        correo: formData.correo!,
        activo: formData.activo!,
      });

      this.usuarioForm.reset({ activo: true });
    }
  }
}
