import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators {

    static telefono(control: AbstractControl): ValidationErrors | null {
        let valor: string = control.value;

        if(!valor) return null;

        valor = valor.replace(/\s/g, '');

        const regex = /^\+?[1-9]\d{7,14}$/;

        if (!regex.test(valor)) {
            return { telefonoInvalido: true };
        }

        const soloDigitos = valor.replace(/\D/g, '');

        if(CustomValidators.numeroBasura(soloDigitos)) {
            return { telefonoInvalido: true };
        }

        return null;
    }

    private static numeroBasura(numero: string): boolean {

        if(/^(\d)\1+$/.test(numero)) return true;

        if("1234567890".includes(numero)) return true;

        if("0987654321".includes(numero)) return true;

        return false;
    }
}