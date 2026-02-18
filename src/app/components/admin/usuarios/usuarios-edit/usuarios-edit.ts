import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { initModals } from 'flowbite';
import { User } from '../../../../interfaces/user.interface';
import { SelectMuseos } from '../../../../services/select-museos/select-museos.service';

@Component({
  selector: 'app-usuarios-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-edit.html',
  styleUrl: './usuarios-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosEdit {
  private formBuilder = inject(FormBuilder);
  //injectar el servicio de SelectMuseos para cargar los museos en el select 
  protected selectMuseosService = inject(SelectMuseos);

  readonly usuario = input<User>();



  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    //password: [''],
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

    effect(() => {
      const usuarioData = this.usuario();
      if (usuarioData) {
        this.usuarioForm.patchValue({
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          rolId: usuarioData.rolId,
          museoId: usuarioData.museoId,
          activo: usuarioData.activo,
        });
      }
    });
  }

  // Cargar museos al hacer clic en el select
  onMuseoSelectClick() {
    this.selectMuseosService.loadMuseos();
  }

  onClickAgree() {
    const usuarioData = this.usuario();


    if (this.usuarioForm.valid && usuarioData) {
      const formData = this.usuarioForm.value;

      this.agreeToUpdate.emit({
        id: usuarioData.id,
        nombre: formData.nombre!,
        email: formData.email!,
        //password: usuarioData.password, 
        rolId: formData.rolId!,
        museoId: formData.museoId!,
        activo: formData.activo!,
        rol: usuarioData.rol,
        museo: usuarioData.museo
      });
    }
  }
}

  /*
  onClickAgree() {
    const usuarioData = this.usuario();


    if (this.usuarioForm.valid && usuarioData) {
      const formData = this.usuarioForm.value;

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

      // Solo incluye password si el usuario escribió algo
      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      this.agreeToUpdate.emit(payload);
    }

  }
  */




