import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fechaReservaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (!valor) {
      return null;
    }

    const fechaSeleccionada = new Date(`${valor}T00:00:00`);

    if (Number.isNaN(fechaSeleccionada.getTime())) {
      return { fechaReservaInvalida: true };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      return { fechaReservaInvalida: true };
    }

    return null;
  };
}