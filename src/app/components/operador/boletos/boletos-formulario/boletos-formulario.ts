// boletos-formulario.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule,  } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormVisit, bandera } from '../../form-visit/form-visit';



@Component({
  selector: 'app-boletos-formulario',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormVisit],
  templateUrl: './boletos-formulario.html',
  styleUrl: './boletos-formulario.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class BoletosFormulario {

  // Variable para controlar si el botón está habilitado
  formularioValido = false;

  constructor(private router: Router) {}

  // Método que recibe el evento del componente hijo
  onFormStatusChange(isValid: boolean) {
    this.formularioValido = isValid;
  }
//Método para continuar al siguiente paso
  continue() {
    //Si el formulario es válido, navegar a la siguiente ruta
    if (this.formularioValido) {
      this.router.navigate(['/operador/boletos']);
    }
  }
}
