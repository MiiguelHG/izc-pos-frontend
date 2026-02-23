import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUsuario } from '../../../../interfaces/create-usuario.interface';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';
import { RolesService } from '../../../../services/roles/roles.service';
@Component({
  selector: 'app-usuarios-create',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-create.html',
  styleUrl: './usuarios-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosCreate {
  private formBuilder = inject(FormBuilder);
  //injectar el servicio de SelectMuseos para cargar los museos en el select 
  protected selectMuseosService = inject(SelectMuseos);
  protected selectRolesService = inject(RolesService);

  protected showPassword = signal(false);


  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rolId: [0, [Validators.required, Validators.min(1)]],
    museoId: [0, [Validators.required, Validators.min(1)]],
    activo: [true, Validators.required],
  });

  agreeToCreate = output<CreateUsuario>();

  // Cargar museos al hacer clic en el select
onAbrirModal() {
  this.selectMuseosService.loadMuseos();
}



  onClickAgree() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;

      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        email: formData.email!,
        password: formData.password!,
        rolId: formData.rolId!,
        museoId: formData.museoId!,
        activo: formData.activo!,
      });

      this.usuarioForm.reset({ activo: true, rolId: 0, museoId: 0 });
      this.resetForm();
      this.closeModal();
    }
  }


  private resetForm(): void {
    this.usuarioForm.reset({
      nombre: '',
      email: '',
      password: '',
      activo: true,
      rolId: 0,
      museoId: 0,
    });
  }

  private closeModal(): void {
    const modal = document.getElementById('create-usuario-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }
}