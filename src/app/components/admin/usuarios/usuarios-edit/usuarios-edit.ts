import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';
import { User } from '../../../../interfaces/user.interface';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';
import { RolesService } from '../../../../services/roles/roles.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-usuarios-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-edit.html',
  styleUrl: './usuarios-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosEdit {
  private formBuilder = inject(FormBuilder);
  protected selectMuseosService = inject(SelectMuseos);
  protected selectRolesService = inject(RolesService);
  protected authService = inject(AuthService);

  protected museos = this.selectMuseosService.museos;
  protected roles = this.selectRolesService.roles;
  readonly usuario = input<User>();
  protected showPassword = signal(false);
  private ultimoUsuarioCargadoId = signal<number | null>(null);

  protected isAdmin = () => this.authService.user()?.rol?.nombre === 'admin';
  protected isDirectorMuseo = () => this.authService.user()?.rol?.nombre === 'directorMuseo';
  protected esElMismoUsuario = () => this.authService.user()?.id === this.usuario()?.id;

// Si el usuario a editar puede ser editado por el usuario logueado
protected esUsuarioEditable = () => {
  const rolUsuarioAEditar = this.usuario()?.rol?.nombre;
  if (this.isAdmin()) return true;
  if (this.isDirectorMuseo()) {
    // directorMuseo NO puede editar a admin ni a otros directorMuseo
    return rolUsuarioAEditar !== 'admin' && rolUsuarioAEditar !== 'directorMuseo';
  }
  return false;
};

  protected esRolBloqueado = () => {
    return !this.isAdmin();
  };

  // El select de museo siempre bloqueado, excepto para admin
  protected esMuseoBloqueado = () => !this.isAdmin();

  usuarioForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(3),
      Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: ['', [Validators.minLength(8), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ+/*\-¿?():]+$/)]],
    rolId: [0, [Validators.required, Validators.min(1)]],
    museoId: [0, [Validators.required, Validators.min(1)]],
    activo: [true, Validators.required],
  });

  protected readonly modalId = computed(() => {
    const user = this.usuario();
    return user ? `edit-usuario-modal-${user.id}` : 'edit-usuario-modal-temp';
  });

  agreeToUpdate = output<User>();

  constructor() {
    afterNextRender(() => initModals());

    // Effect: cargar datos solo cuando cambia el usuario
    effect(() => {
      const usuarioData = this.usuario();
      if (!usuarioData) return;
      if (this.ultimoUsuarioCargadoId() === usuarioData.id) return;

      this.ultimoUsuarioCargadoId.set(usuarioData.id ?? null);

      this.usuarioForm.patchValue({
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        rolId: usuarioData.rolId,
        museoId: usuarioData.museoId,
        activo: usuarioData.activo,
      });
    });


    effect(() => {
      const user = this.authService.user();
      const usuarioData = this.usuario();
      if (!user || !usuarioData) return;

      const rolIdControl = this.usuarioForm.get('rolId');
      const operadorId = this.getOperadorRolId();

      if (this.isAdmin()) {
        this.usuarioForm.get('museoId')?.enable();
        rolIdControl?.enable();
        return;
      }

      this.usuarioForm.get('museoId')?.setValue(user.museoId ?? 0);
      this.usuarioForm.get('museoId')?.disable();

      rolIdControl?.setValue(operadorId);
      rolIdControl?.disable();
    });
  }

  private getOperadorRolId(): number {
    const roles = this.roles.value()?.data ?? [];
    const operador = roles.find((rol) => rol.nombre === 'operador');

    return operador?.id ?? 4;
  }

  onAbrirModal() {
    this.ultimoUsuarioCargadoId.set(null);
  }

  onClickAgree() {
    const usuarioData = this.usuario();
    if (!this.usuarioForm.valid || !usuarioData) return;

    const formData = this.usuarioForm.getRawValue();

    const payload: any = {
      id: usuarioData.id,
      nombre: formData.nombre!,
      email: formData.email!,
      rolId: formData.rolId!,
      museoId: formData.museoId!,
      activo: formData.activo!,
      rol: usuarioData.rol,
      museo: usuarioData.museo,
    };

    if (formData.password && formData.password.trim() !== '') {
      payload.password = formData.password;
    }

    this.agreeToUpdate.emit(payload);
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