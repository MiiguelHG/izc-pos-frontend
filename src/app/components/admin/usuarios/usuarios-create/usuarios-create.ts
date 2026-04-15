import { afterNextRender, ChangeDetectionStrategy, Component, effect, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUsuario } from '../../../../interfaces/create-usuario.interface';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';
import { RolesService } from '../../../../services/roles/roles.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-usuarios-create',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-create.html',
  styleUrl: './usuarios-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosCreate {

  private formBuilder = inject(FormBuilder);
  protected selectMuseosService = inject(SelectMuseos);
  protected selectRolesService = inject(RolesService);
  private authService = inject(AuthService);

  protected museos = this.selectMuseosService.museos;
  protected roles = this.selectRolesService.roles;

  protected showPassword = signal(false);

  protected isAdmin = () => this.authService.user()?.rol?.nombre === 'admin';

  usuarioForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ+/*\-¿?():]+$/)]],
    rolId: [0, [Validators.required, Validators.min(1)]],
    museoId: [0, [Validators.required, Validators.min(1)]],
    activo: [true, Validators.required],
  });

  agreeToCreate = output<CreateUsuario>();

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (!user) return;

      const rolIdControl = this.usuarioForm.get('rolId');
      const operadorId = this.getOperadorRolId();

      if (!this.isAdmin()) {
        const museoId = user.museoId ?? 0;
        this.usuarioForm.get('museoId')?.setValue(museoId);
        this.usuarioForm.get('museoId')?.disable();

        rolIdControl?.setValue(operadorId);
        rolIdControl?.disable();
      } else {
        this.usuarioForm.get('museoId')?.enable();
        rolIdControl?.enable();
      }
    });
  }

  onClickAgree() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.getRawValue(); // getRawValue para incluir campos deshabilitados como museoId

      this.agreeToCreate.emit({
        nombre: formData.nombre!,
        email: formData.email!,
        password: formData.password!,
        rolId: formData.rolId!,
        museoId: formData.museoId!,
        activo: formData.activo!,
      });

      this.resetForm();
      this.closeModal();
    }
  }

  onCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    const operadorId = this.getOperadorRolId();

    this.usuarioForm.reset({
      nombre: '',
      email: '',
      password: '',
      activo: true,
      rolId: this.isAdmin() ? 0 : operadorId,
      museoId: this.isAdmin() ? 0 : (this.authService.user()?.museoId ?? 0),
    });

    if (!this.isAdmin()) {
      this.usuarioForm.get('rolId')?.disable();
    }
  }

  private getOperadorRolId(): number {
    const roles = this.roles.value()?.data ?? [];
    const operador = roles.find((rol) => rol.nombre === 'operador');

    return operador?.id ?? 4;
  }

  private closeModal(): void {
    const modal = document.getElementById('create-usuario-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  get nombre() { 
    return this.usuarioForm.get('nombre'); 
  }
  get email() { 
    return this.usuarioForm.get('email'); 
  }
  get password() { 
    return this.usuarioForm.get('password'); 
  }
  get rolId() { 
    return this.usuarioForm.get('rolId'); 
  }
  get museoId() { 
    return this.usuarioForm.get('museoId'); 
  }
}
