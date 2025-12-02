//fomr-visit.ts
// boletos-formulario.ts
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';



//Exportar variables para la impresión de tickets
export let nombreVisitante = '';
export let ExportTotalVisitantes = 0;
export let ExportFechaEmision = '';
export let bandera = 0;

@Component({
  selector: 'app-form-visit',
  imports: [ReactiveFormsModule, CommonModule, JsonPipe, RouterModule],
  templateUrl: './form-visit.html',
  styleUrl: './form-visit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormVisit {
  // Emitir el estado del formulario al componente padre
  @Output() formStatusChange = new EventEmitter<boolean>();

  [x: string]: any;

  constructor(private router: Router) { }
  private formBuilder = inject(FormBuilder);

  // Formulario para crear un nuevo visitante
  FormVisitante = this.formBuilder.group({
    nombre: ['', Validators.required],
    edad: [null, [Validators.required, Validators.min(1), Validators.max(150)]],
    cp: [null, [Validators.required, Validators.maxLength(5), Validators.pattern(/^\d{0,5}$/)]],
    estado: ['', Validators.required],
    pais: ['', Validators.required],
    grupo: ['No', Validators.required],
    un_genero: [''], // ← Nuevo campo
    hombre: [0, [Validators.max(1000)]],
    mujer: [0, [Validators.max(1000)]],
    otrogenero: [0, [Validators.max(1000)]],
    totalvisitantes: [{ value: 0, disabled: true }],
    fecha: [{ value: new Date().toLocaleDateString(), disabled: true }],
  });


  //Logica para el grupo
  ngOnInit() {
    this.FormVisitante.valueChanges.subscribe(val => {
      const esGrupo = val.grupo === 'Sí';
      const hombre = Number(val.hombre) || 0;
      const mujer = Number(val.mujer) || 0;
      const otre = Number(val.otrogenero) || 0;
      const Ungenero = val.un_genero && val.un_genero !== '';
      //----------------------------------------------
      // Exportar Nombre del visitante para impresión
      nombreVisitante = String(val.nombre);
      // Exportar Fecha de emisión para impresión
      ExportFechaEmision = String(val.fecha);
      //----------------------------------------------

      if (!esGrupo) {
        //si se selecciona un genero en select
        if (Ungenero) {
           // Resetear los campos numéricos y total a 1
          this.FormVisitante.patchValue({totalvisitantes: 1, hombre: 0, mujer: 0, otrogenero: 0 }, { emitEvent: false });
          // Deshabilitar los campos de cantidad
          this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.disable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.disable({ emitEvent: false });
          ExportTotalVisitantes = 1;
        } else {
          // Habilitar los campos de cantidad
          this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });
        }

        // Limitar cada campo a máximo 1
        if (hombre > 1) {
          this.FormVisitante.patchValue({ hombre: 1 }, { emitEvent: false });
          return; // Salir para evitar conflictos
        }
        if (mujer > 1) {
          this.FormVisitante.patchValue({ mujer: 1 }, { emitEvent: false });
          return;
        }
        if (otre > 1) {
          this.FormVisitante.patchValue({ otrogenero: 1 }, { emitEvent: false });
          return;
        }

        // Manejar habilitación/deshabilitación según el campo seleccionado
        if (hombre === 1) {
          this.FormVisitante.get('mujer')?.disable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.disable({ emitEvent: false });
          this.FormVisitante.patchValue({ mujer: 0, otrogenero: 0 }, { emitEvent: false });
        } else if (mujer === 1) {
          this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.disable({ emitEvent: false });
          this.FormVisitante.patchValue({ hombre: 0, otrogenero: 0 }, { emitEvent: false });
        } else if (otre === 1) {
          this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.disable({ emitEvent: false });
          this.FormVisitante.patchValue({ hombre: 0, mujer: 0 }, { emitEvent: false });
        } else {
          // Si todos están en 0, habilitar todos los campos
          this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });
        }
      } else {
        // Si es grupo, habilitar todos los campos
        this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
        this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
        this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });



        // Calcular total usando getRawValue() para incluir campos deshabilitados
        const valores = this.FormVisitante.getRawValue();
        const total = (Number(valores.hombre) || 0) + (Number(valores.mujer) || 0) + (Number(valores.otrogenero) || 0);
        this.FormVisitante.patchValue({ totalvisitantes: total }, { emitEvent: false });

        ExportTotalVisitantes = total;
        this.formStatusChange.emit(this.FormVisitante.valid);
      }

      this.formStatusChange.emit(this.FormVisitante.valid);

    });
    // Emitir estado inicial
    this.formStatusChange.emit(this.FormVisitante.valid);
  }


  // Getter para el estado de validez del formulario
  get formularioValido(): boolean {
    return this.FormVisitante.valid;
  }

}


