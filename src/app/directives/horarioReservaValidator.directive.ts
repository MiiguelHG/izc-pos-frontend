import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function timeToMinutes(value: string): number | null {
  const match = /^([0-1]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

export function horarioReservaValidator(minHora: string, maxHora: string): ValidatorFn {
  const minMinutes = timeToMinutes(minHora);
  const maxMinutes = timeToMinutes(maxHora);

  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (!valor || minMinutes === null || maxMinutes === null) {
      return null;
    }

    const actualMinutes = timeToMinutes(valor);

    if (actualMinutes === null) {
      return { horarioReservaInvalida: true };
    }

    if (actualMinutes < minMinutes || actualMinutes > maxMinutes) {
      return { horarioReservaInvalida: true };
    }

    return null;
  };
}