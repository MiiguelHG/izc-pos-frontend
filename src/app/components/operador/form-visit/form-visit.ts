import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
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
  //Emitir el componente del estado al formulario padre
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
    un_genero: [''],
    // solo validación de rango
    hombre: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),
    mujer: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),
    otrogenero: this.formBuilder.control<number | null>(null, [Validators.max(1000)]),

    totalvisitantes: [{ value: 0, disabled: true }],
    fecha: [{ value: new Date().toLocaleDateString(), disabled: true }],
  });

  ngOnInit() {
    let grupoAnterior = this.FormVisitante.get('grupo')?.value;

    this.FormVisitante.valueChanges.subscribe(val => {
      const esGrupo = val.grupo === 'Sí';
      const hombre = Number(val.hombre) || 0;
      const mujer = Number(val.mujer) || 0;
      const otre = Number(val.otrogenero) || 0;
      const Ungenero = val.un_genero && val.un_genero !== '';
      const TotalVisitantes = hombre + mujer + otre;

      // Exportar variabls para la impresión de tickets
      nombreVisitante = String(val.nombre);
      ExportFechaEmision = String(val.fecha);

      //Si total visitantes es mayor a 1 y  un_genero es vacio '' el formulario no es valido
      if (TotalVisitantes > 1 && val.un_genero === '') {
        this.formStatusChange.emit(false);
      } else {
        this.formStatusChange.emit(this.FormVisitante.valid);
      }
      
        // No es un grupo
      if (!esGrupo) {
        if (Ungenero) {
          // Si seleccionó género en el select
          this.FormVisitante.patchValue({
            totalvisitantes: 1,
            hombre: null,
            mujer: null,
            otrogenero: null
          }, { emitEvent: false });

          this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.disable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.disable({ emitEvent: false });

          ExportTotalVisitantes = 1;
          this.formStatusChange.emit(this.FormVisitante.valid);
        } else {
          // Si NO seleccionó género en el select, habilitar campos numéricos
          this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
          this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
          this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });

          // Limitar cada campo a máximo 1
          if (hombre > 1) {
            this.FormVisitante.patchValue({ hombre: 1 }, { emitEvent: false });
            return;
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
            this.FormVisitante.patchValue({ mujer: null, otrogenero: null }, { emitEvent: false });
          } else if (mujer === 1) {
            this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
            this.FormVisitante.get('otrogenero')?.disable({ emitEvent: false });
            this.FormVisitante.patchValue({ hombre: null, otrogenero: null }, { emitEvent: false });
          } else if (otre === 1) {
            this.FormVisitante.get('hombre')?.disable({ emitEvent: false });
            this.FormVisitante.get('mujer')?.disable({ emitEvent: false });
            this.FormVisitante.patchValue({ hombre: null, mujer: null }, { emitEvent: false });
          } else {
            // Si todos están en 0, habilitar todos
            this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
            this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
            this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });
          }

          const total = hombre + mujer + otre;
          this.FormVisitante.patchValue({ totalvisitantes: total }, { emitEvent: false });
          ExportTotalVisitantes = total;

        }
      } else {
        // Si es un grupo
        this.FormVisitante.get('hombre')?.enable({ emitEvent: false });
        this.FormVisitante.get('mujer')?.enable({ emitEvent: false });
        this.FormVisitante.get('otrogenero')?.enable({ emitEvent: false });

        const valores = this.FormVisitante.getRawValue();
        const total = (Number(valores.hombre) || 0) +
          (Number(valores.mujer) || 0) +
          (Number(valores.otrogenero) || 0);

        this.FormVisitante.patchValue({ totalvisitantes: total }, { emitEvent: false });
        ExportTotalVisitantes = total;

        // VALIDACIÓN PARA GRUPOS:verificar que total >= 2 y campos básicos llenos
        const estado = val.estado;
        const cp = val.cp;
        const pais = val.pais;
        const edad = val.edad;
        const nombre = val.nombre;

        const camposBasicosValidos = !!(estado && cp && pais && edad && nombre);
        const totalValido = total >= 2;
        const formularioValidoGrupo = camposBasicosValidos && totalValido;

        this.formStatusChange.emit(formularioValidoGrupo);
      }
    });
  }

  get formularioValido(): boolean {
    return this.FormVisitante.valid;
  }
}