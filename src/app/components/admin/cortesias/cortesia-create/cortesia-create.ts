import { afterNextRender, ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { initFlowbite} from 'flowbite';
import { MuseosService } from '../../../../services/museos/museos.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Invitado } from '../../../../interfaces/invitado.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cortesia-create',
  imports: [ReactiveFormsModule],
  templateUrl: './cortesia-create.html',
  styleUrl: './cortesia-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CortesiaCreate {
  private museosService = inject(MuseosService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);


  protected museos = this.museosService.museos;
  protected usuario = this.authService.user;

  invitadoToCreate = output<Invitado>();

  invitadoForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    motivo: ['', Validators.required],
    museoId: ['', Validators.required],
  })


  constructor() { 
    afterNextRender(() => initFlowbite());
  }

  agreeToCreate() {
    if (!this.invitadoForm.valid){
      console.log("formulario incompleto")
      return;
    }

    const formData = this.invitadoForm.value;

    this.invitadoToCreate.emit({
      nombre: formData.nombre!,
      motivo: formData.motivo!,
      usuarioId: this.usuario()?.id!,
      museoId: Number(formData.museoId!),
    });

    this.invitadoForm.reset();
  }
}
